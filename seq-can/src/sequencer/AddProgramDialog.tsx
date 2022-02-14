
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { SetupId, useAppendSetupProgramIdListEntry } from '../state/setup';
import { DialogActions, ListItemButton } from '@mui/material';
import { useCreateProgram, useProgramList } from '../state/program';

export type AddProgramProps = { setupId: SetupId, open: boolean, onClose: () => void }

export function AddProgramDialog({ setupId, open, onClose }: AddProgramProps) {

    console.log("AddProgramDialog", open);

    const programs = useProgramList()
    const createProgram = useCreateProgram();
    const appendSetupProgramIdListEntry = useAppendSetupProgramIdListEntry(setupId);

    const handleCreate = () => {
        const programId = createProgram();
        const programIndex = appendSetupProgramIdListEntry(programId);
        console.log("CREATED", programId, programIndex)
        onClose();
    };

    const handleAdd = () => {
        console.log("handleAdd")
        onClose();
    };

    const handleCopy = () => {
        console.log("handleCopy")
        onClose();
    };

    const handleListItemClick = (value: string) => {
        console.log("handleListItemClick", value)
        onClose();
    };

    const handleClose = (...args:any[]) => {
        console.log("handleClose", args)
        onClose();
    }

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Add Program</DialogTitle>
            <List sx={{ pt: 0 }}>
                {programs.map(({programId, programName}, index) => (
                    <ListItemButton onDoubleClick={() => handleListItemClick(programId)} key={programId} autoFocus={index === 0}>
                        <ListItemText primary={programName} />
                    </ListItemButton>
                ))}
            </List>
            <DialogActions>
                <Button onClick={handleCreate} variant="outlined" autoFocus>Create New</Button>
                <Button onClick={handleAdd}>Add Selected</Button>
                <Button onClick={handleCopy}>Copy Selected</Button>
            </DialogActions>
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