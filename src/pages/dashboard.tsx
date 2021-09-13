import { useContext, useEffect } from "react";
import { Can } from "../components/Can";
import { AuthContext } from "../contexts/AuthContext";
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import { withSSRauth } from "../utils/withSSRauth";

export default function Dashboard(){

    const { user, singOut } = useContext(AuthContext);


    useEffect(() => {
        api.get('/me')
        .then( response => console.log(response))
        .catch( error => console.error(error))
    },[]);

    return(
        <div>
            <h1>PAGINA DE DASHBOARD</h1>
            <h2>{user.email}</h2>

            <button onClick={singOut}>Sign out</button>

            <Can permissions={['metrics.list']}>
                <div> Métricas permitidas </div>
            </Can>
        </div>
    );
}

export const GetServerSideProps = withSSRauth( async(ctx) =>{
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get('/me')

    return {
        props:{}
    }
})