import {Route,Routes} from 'react-router-dom'
import Lobby from './screen/Lobby';
import Room from './screen/Room'

export default function App()
{
    return (
        <div>
            <Routes>
                <Route path='/' element={<Lobby/>}/>
                <Route path='/room/:username/:Room_id' element={<Room/>}/>
            </Routes>
        </div>
    );
}