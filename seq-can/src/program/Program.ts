import { addToStage, removeFromStage, bounds } from '../canvas';
import createjs from 'eyeree-createjs-module';

import Container = createjs.Container;
import Graphics = createjs.Graphics;
import { Bounds } from '../canvas/Canvas';

export type ProgramArgs = {
    Graphics: typeof Graphics,
    Tween: typeof createjs.Tween,
    Sound: typeof createjs.Sound,
    LoadQueue: typeof createjs.LoadQueue,
    Shape: typeof createjs.Shape,
    MovieClip: typeof createjs.MovieClip,
    Ease: typeof createjs.Ease,
    createjs: typeof createjs,
    container:createjs.Container,
    bounds:Bounds
}

const programArgs = {
    Graphics: Graphics,
    Tween: createjs.Tween,
    Sound: createjs.Sound,
    LoadQueue: createjs.LoadQueue,
    Shape: createjs.Shape,
    MovieClip: createjs.MovieClip,
    Ease: createjs.Ease,
    createjs: createjs
}

export type StepArgs = {
    index:number,
    time:number,
}

type StepFunction = (args:StepArgs) => void;

export type ProgramProps = {
    step:StepFunction
}

export type ProgramFunction = (args:ProgramArgs) => ProgramProps;

const DefaultProgramProps:ProgramProps = {
    step: () => {}
}

export class Program {

    private props = DefaultProgramProps;
    private container:Container|null = null;

    static getProgram() {
        return program;
    }
    
    step(index:number, time:number) {
        this.props.step({index, time})
    }

    setFactoryFunction(fn:ProgramFunction|null) {
        this.unload();
        if(fn !== null) {
            this.container = new createjs.Container();
            this.props = fn({...programArgs, container:this.container, bounds});
            addToStage(this.container);
        }
    }

    unload() {
        if(this.container) {
            removeFromStage(this.container);
            this.container = null;
        }
        this.props = { step: () => {} };
    }

}

const program = new Program();
