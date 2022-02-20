const defaultGraphics = new Graphics().beginFill("DeepSkyBlue").drawCircle(0, 0, 50);

class StateSet extends Set<State> {}

class StateManager {

    private readonly objectStates = new Map<DisplayObject, StateSet>();

    addState(o:DisplayObject, state:State) {
        let states = this.objectStates.get(o);
        if(!states) {
            states = new StateSet();
            this.objectStates.set(o, states);
        }
        states.add(state);
    }

    removeState(o:DisplayObject, state:State) {
        let states = this.objectStates.get(o);
        if(states) {
            states.delete(state);
            if(states.size === 0) {
                this.objectStates.delete(o);
                o.parent.removeChild(o);
            }
        }
    }

    changeState(o:DisplayObject, oldState:State, newState:State) {
        let states = this.objectStates.get(o);
        if(!states) throw new Error(`StateManager.changeState: DisplayObject "${o}" does not have old state "${oldState}" when changing state to "${newState}.`);
        states.delete(oldState);
        states.add(newState);
    }

}

const stateManager = new StateManager();

class State {

    add(o:DisplayObject) {
    }

}

class ManagedShape extends Shape {

    constructor(graphics:Graphics, ...states:State[]) {
        super()
    }
}

class Emitter extends Container {

    public graphics:Graphics = defaultGraphics;

    constructor() {
        super()
        this.x = 100;
        this.y = 100;
        addToStage(this);
    }

    emit() {
      const shape = new Shape(this.graphics);
      shape.x = 0;
      shape.y = 0;
      this.addChild(shape);
    }

}
