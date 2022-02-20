import * as data from './data'

const Action = () => {

    const Name = () => <data.String/>

    return <data.Entity>
        <Name/>
    </data.Entity>

}

const Program = () => {

    const Name = () => <data.String/>
    const Code = () => <data.String/>
    const Actions = () => <data.List><Action/></data.List>
    
    return <data.Entity>
        <Name/>
        <Code/>
        <Actions/>
    </data.Entity>

}

export default data.components({Action, Program})

