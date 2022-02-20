import { addToStage, removeFromStage, bounds, Bounds } from '../canvas';
import createjs from 'eyeree-createjs-module';

import Container = createjs.Container;
import Graphics = createjs.Graphics;
import { ActionName, ProgramCode, ProgramErrorNullable } from '../state/program';

export type SequencerInfo = {
    stepCount:number,
    stepMS:number,
    bpm:number,
    paused:boolean
}

export type ProgramArgs = {
    Graphics: typeof Graphics,
    Tween: typeof createjs.Tween,
    Sound: typeof createjs.Sound,
    LoadQueue: typeof createjs.LoadQueue,
    Shape: typeof createjs.Shape,
    MovieClip: typeof createjs.MovieClip,
    Ease: typeof createjs.Ease,
    createjs: typeof createjs,
    container:Container,
    bounds:Bounds,
    sequencer:SequencerInfo
}

const programArgs = {
    Graphics: Graphics,
    Tween: createjs.Tween,
    Sound: createjs.Sound,
    LoadQueue: createjs.LoadQueue,
    Shape: createjs.Shape,
    MovieClip: createjs.MovieClip,
    Ease: createjs.Ease,
    createjs: createjs,
    bounds: bounds,
    sequencer: {    // updated by setSequencerState below
        stepCount: 0,
        stepMS: 0,
        bpm: 0,
        paused: true
    }
    // container is added by Runtime class
}

export type ActionArgs = {
    stepIndex:number
}

export type ActionFunction = (args:ActionArgs) => void;

export type ActionMap = {
    [key:string]: ActionFunction
}

export type ProgramProps = {
    actions?: ActionMap,
}

export type ProgramReturn = undefined | ActionFunction | ProgramProps;

export type ProgramFunction = (args:ProgramArgs) => ProgramReturn;

export type ActionListEntry = {
    name:ActionName,
    fn:ActionFunction
}

export type ActionList = Array<ActionListEntry>

export type SetErrorFunction = (error:ProgramErrorNullable) => void

function isActionFunction(value:any): value is ActionFunction {
    return typeof(value) === 'function';
}

function isProgramProps(value:any): value is ProgramProps {
    return typeof(value) === 'object'
}

const chromeErrorLocation = /<anonymous>:(?<line>\d+):(?<column>\d+)/
const firefoxErrorLocation = /Function:(?<line>\d+):(?<column>\d+)/

export class Runtime {

    static setSequencerState(bpm: number, stepCount: number, paused: boolean) {
        programArgs.sequencer.bpm = bpm;
        programArgs.sequencer.stepCount = stepCount;
        programArgs.sequencer.stepMS = 60000 / bpm;
        programArgs.sequencer.paused = paused;
    }

    private container:Container|null = null;
    public actions:ActionList = [];
    public error:ProgramErrorNullable = null;

    private _enabled:boolean = true;
    private code:string = "";

    constructor(code:ProgramCode, private setError:SetErrorFunction) {
        this.setCode(code);
    }

    private clearError() {
        this.setError(null)
    }

    private handleException(e:any) {
    
        let line = 0;
        let column = 0;
    
        const stack = e.stack;
        if (typeof stack == 'string') {
    
            let match = stack.match(chromeErrorLocation);
            if (!match) {
                match = stack.match(firefoxErrorLocation);
            }
    
            if (match) {
                try {
                    line = Number.parseInt(match.groups!.line) - 3;
                    column = Number.parseInt(match.groups!.column);
                } catch (e) {
                    console.error(`could not parse matched line or column numbers: ${match.groups!.line} ${match.groups!.column}`)
                }
            }
    
        }
    
        this.setError({ message: e.toString(), line, column })
    
    }

    public reset() {
        this.setCode(this.code);
    }

    public setCode(code:ProgramCode) {

        // If anything goes wrong while initializing the new code, leave the old code
        // running and report the error. If successful, the new code's new container 
        // replaces the old code's container on stage.
        
        const container = new Container();
        
        try {            
            const init = this.getInitializationFunction(code);        
            const initResult = init({...programArgs, container});
            this.load(initResult, container);
            this.code = code;
            this.clearError();
        } catch(e:any) {
            this.handleException(e);
            return;
        }

    }

    private getInitializationFunction(code: string):ProgramFunction {
        const source = `return function PROGRAM_ROOT (_) {\n${code}\n}`;
        const wrapper = new Function(source); // eslint-disable-line no-new-func
        return wrapper();
    }

    public unload() {
        if(this.container) {
            removeFromStage(this.container);
            this.container = null;
        }
        this.actions = [] 
    }

    private load(initResult:ProgramReturn, container:Container) {

        let actions:ActionList = []

        if(isActionFunction(initResult)) {
            actions = this.loadActions({step: initResult})
        } else if(isProgramProps(initResult)) {
            
            if(initResult.actions) {
                actions = this.loadActions(initResult.actions)
            }

        }

        this.actions = actions;

        if(this.container && this._enabled) removeFromStage(this.container);
        this.container = container;
        if(this._enabled) addToStage(this.container);

    }

    private loadActions(actions:ActionMap) {

        return Object.entries(actions).map(([name, value]) => {
            if(typeof name != 'string') {
                throw new Error(`Action key is not a string.`)
            }
            if(!isActionFunction(value)) {
                throw new Error(`Action "${name}" is not a function.`);
            }
            const fn = (args:ActionArgs) => {
                if(!this._enabled) return;
                try {
                    value(args);
                } catch(e:any) {
                    this.handleException(e);
                }
            }
            return {name, fn}
        })

    }

    public get enabled() {
        return this._enabled;
    }

    public set enabled(value:boolean) {
        if(value != this._enabled) {
            if(this._enabled) {
                if(this.container) {
                    removeFromStage(this.container);
                }
                this._enabled = false;
            } else {
                if(this.container) {
                    addToStage(this.container);
                }
                this._enabled = true;
            }
        }
    }

}
