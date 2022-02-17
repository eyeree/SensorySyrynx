import { atom, useRecoilState } from 'recoil';
import { persistAtom } from './persistance';

type CanvasSize = { width: number, height: number }
const canvasSizeState = atom<CanvasSize>({
    key: "canvasSize",
    default: { width: 0.8, height: 0.8 },
    effects: [persistAtom]
})

export const useCanvasSizeState = () => useRecoilState(canvasSizeState)

type ActionTitleWidth = number;
const actionTitleWidth = atom<ActionTitleWidth>({
    key: "actionTitleWidth",
    default: 100,
    effects: [persistAtom]
})

export const useActionTitleWidthState = () => useRecoilState(actionTitleWidth)
