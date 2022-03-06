import { createBoundPropertySelector, createBoundAtom, createBoundArrayPropertySelector } from "./context";
import * as model from "./model";
import { persistAtom} from "./persistance";

const defaultTags:model.TagArray = []

const defaultSetupName:model.SetupName = "setup"
const defaultSetupStepCount:model.SetupStepCount = 8;
const defaultSetupBPM:model.SetupBPM = 120;
const defaultSetupPrograms:model.SetupProgramArray = []

export const Setup = createBoundAtom<model.Setup, model.SetupId>({
    key: "Setup",
    default: () => ({
        tags: defaultTags,
        name: defaultSetupName,
        stepCount: defaultSetupStepCount,
        bpm: defaultSetupBPM,
        programs: defaultSetupPrograms
    }),
    effects: [persistAtom]
})

export const SetupTags = createBoundArrayPropertySelector({
    key: "SetupTags",
    prop: "tags",
    default: defaultTags,
    objectBinding: Setup
})

export const SetupName = createBoundPropertySelector({
    key: "SetupName",
    prop: "name",
    default: defaultSetupName,
    objectBinding: Setup
})

export const SetupStepCount = createBoundPropertySelector({
    key: "SetupStepCount",
    prop: "stepCount",
    default: defaultSetupStepCount,
    objectBinding: Setup
})

export const SetupBPM = createBoundPropertySelector({
    key: "SetupStepCount",
    prop: "stepCount",
    default: defaultSetupBPM,
    objectBinding: Setup
})

export const SetupPrograms = createBoundArrayPropertySelector({
    key: "SetupPrograms",
    prop: "programs",
    default: defaultSetupPrograms,
    objectBinding: Setup
})

