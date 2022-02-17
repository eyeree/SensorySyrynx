
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { SetupId, useAppendSetupProgramIdListEntry } from '../state/setup';
import { Checkbox, FormControlLabel, ListItemButton, Typography } from '@mui/material';
import { ProgramId, useCreateProgram, useProgramList } from '../state/program';
import { useState } from 'react';
import { Label } from '@mui/icons-material';
import { theme } from '../common/css';

export type AddProgramProps = { setupId: SetupId, open: boolean, onClose: () => void, target: HTMLDivElement }

export function AddProgramDialog({ setupId, open, onClose, target }: AddProgramProps) {

    // console.log("AddProgramDialog", open);

    const programs = useProgramList()
    const createProgram = useCreateProgram();
    const appendSetupProgramIdListEntry = useAppendSetupProgramIdListEntry(setupId);
    const [copySelected, setCopySelected] = useState<boolean>(false);

    const handleCreate = () => {
        const programId = createProgram();
        const programIndex = appendSetupProgramIdListEntry(programId);
        console.log("CREATED", programId, programIndex)
        onClose();
    };

    const handleCopy = (programId: ProgramId) => {
        console.log("handleCopy", programId)
        onClose();
    };

    const handleAdd = (programId: ProgramId) => {
        console.log("handleAdd", programId)
        onClose();
    };

    const handleClose = () => {
        onClose();
    }

    // primaryTypographyProps={{ style: {color: "palette.secondary.main"} }}
    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Add Program</DialogTitle>
            <List sx={{ pt: 0 }}>
                <ListItemButton onClick={handleCreate}  sx={{background: theme.palette.secondary.main}}>
                    <ListItemText>New Program</ListItemText>
                </ListItemButton>
                {programs.map(({programId, programName}, index) => (
                    <ListItemButton key={programId} onClick={() => handleAdd(programId)}>
                        <ListItemText primary={programName} />
                    </ListItemButton>
                ))}
            </List>
            <FormControlLabel
                control={<Checkbox onChange={(_, selected:boolean) => setCopySelected(selected)} />} 
                label="Copy Program" sx={{alignSelf:"center", marginRight:0, color: theme.palette.text.secondary, fontWeight: theme.typography.fontWeightLight}}
            />
        </Dialog>
    );
}

// export default function SimpleDialogDemo() {
//   const [open, setOpen] = React.useState(false);
//   const [selectedValue, setSelectedValue] = React.useState(emails[1]);

//   const handleClickOpen = () => {
//     setOpen(true);
//   };

//   const handleClose = (value: string) => {
//     setOpen(false);
//     setSelectedValue(value);
//   };

//   return (
//     <div>
//       <Typography variant="subtitle1" component="div">
//         Selected: {selectedValue}
//       </Typography>
//       <br />
//       <Button variant="outlined" onClick={handleClickOpen}>
//         Open simple dialog
//       </Button>
//       <SimpleDialog
//         selectedValue={selectedValue}
//         open={open}
//         onClose={handleClose}
//       />
//     </div>
//   );
// }