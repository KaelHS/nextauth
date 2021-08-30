import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { api } from "../services/api";

export default function Dashboard(){

    const { user } = useContext(AuthContext);

    useEffect(() => {
        api.get('/me').then( response => console.log(response));
    },[]);

    return(
        <div>
            <h1>PAGINA DE DASHBOARD</h1>
            <h2>{user.email}</h2>
        </div>
    );
}