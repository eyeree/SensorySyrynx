import './Sequencer.css'
import { Controls } from './Controls';
import { Program } from './Program';

export function Sequencer() {
    return <div className='Sequencer'>
        <Controls/>
        <Program/>
    </div>
}