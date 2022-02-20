
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { SetupId, useAppendSetupProgramIdListEntry, useSetSelectedProgramIndex } from '../state/setup';
import { Checkbox, FormControlLabel, Button, ListItemButton, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { ProgramId, useCreateProgram, useProgramList, useCopyProgram } from '../state/program';
import { useState } from 'react';
import { flexRow, theme } from '../common/css';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { css } from '@emotion/css';

type OnClose = (added?:AddProgramResult) => void
type AddProgramDialogProps = { setupId: SetupId, open: boolean, onClose: OnClose }

function AddProgramDialog({ setupId, open, onClose }: AddProgramDialogProps) {

    const programs = useProgramList()
    const createProgram = useCreateProgram();
    const copyProgram = useCopyProgram();
    const appendSetupProgramIdListEntry = useAppendSetupProgramIdListEntry(setupId);
    const [copySelected, setCopySelected] = useState<boolean>(false);

    const handleCreate = () => {
        const programId = createProgram();
        const programIndex = appendSetupProgramIdListEntry(programId);
        onClose({isNew:true});
    };

    const handleCopy = (sourceProgramId: ProgramId) => {
        const programId = copyProgram(sourceProgramId);
        const programIndex = appendSetupProgramIdListEntry(programId);
        onClose({isNew:true});
    };

    const handleAdd = (programId: ProgramId) => {
        const programIndex = appendSetupProgramIdListEntry(programId);
        onClose({isNew:false});
    };

    const handleClose = () => {
        onClose();
    }

    // sx={{background: theme.palette.secondary.main}}
    // primaryTypographyProps={{ style: {color: "palette.secondary.main"} }}
    return (
        <Dialog onClose={handleClose} open={open} PaperProps={{sx:{width:500}}}>
            <DialogTitle>Add Program</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Select a program below to add it to the current setup. If 'Copy Program' is enabled, a new copy 
                    of the program will be added to the setup instead. Or click 'New Program' to add a new default
                    program to the setup.
                </DialogContentText>
                <List sx={{ maxHeight: 300, overflow: 'auto', display: 'flex', flexFlow: "column wrap" }}>
                    {programs.map(({programId, programName}, index) => (
                        <ListItemButton key={programId} onClick={(e) => e.ctrlKey || copySelected ? handleCopy(programId) : handleAdd(programId)}>
                            <ListItemText primary={programName} />
                        </ListItemButton>
                    ))}
                </List>
                <Button variant="contained" onClick={handleCreate} color="secondary" sx={{margin:1}}>
                    New Program
                </Button>
                <FormControlLabel
                    control={<Checkbox onChange={(_, selected:boolean) => setCopySelected(selected)} />} 
                    label="Copy Program" sx={{alignSelf:"center", marginRight:0, color: theme.palette.text.secondary, fontWeight: theme.typography.fontWeightLight}}
                />
            </DialogContent>
        </Dialog>
    );
}


export type AddProgramResult = {isNew:boolean}
export type OnAddProgram = (added:AddProgramResult) => void

export type AddProgramProps = { setupId: SetupId, onAddProgram:OnAddProgram }

export function AddProgram({ setupId, onAddProgram }: AddProgramProps) {

    const [open, setOpen] = useState(false);

    const onClick = () => setOpen(true)
    const onClose = (added?:AddProgramResult) => {
        if(added) onAddProgram(added)
        setOpen(false) 
    }

    return <>
        <Button variant="text" startIcon={<AddCircleOutlineIcon />} onClick={onClick}>add program</Button>
        <AddProgramDialog setupId={setupId} open={open} onClose={onClose}/>
    </>
}