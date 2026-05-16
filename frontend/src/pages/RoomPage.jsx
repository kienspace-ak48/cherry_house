import roomApi from '../api/roomApi';
import { useState, useEffect } from 'react';

function RoomPage(){
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
        const fetchRooms = async ()=>{
            setLoading(true);
        try {
            const res = await roomApi.getAll();
            setRooms(res.data.data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    }
    fetchRooms();
    }, [])
    return (
        <div>
            <h1>Room Page</h1>
            <hr />
            {loading? <div>Loading...</div> : <div>
                {rooms.map((room)=>(
                    <div key={room.id}>
                        <h2>{room.name}</h2>
                        <p>{room.description}</p>
                    </div>
                ))}
            </div>}
            
        </div>
    )
}

export default RoomPage