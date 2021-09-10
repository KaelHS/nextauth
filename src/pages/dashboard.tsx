import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import { withSSRauth } from "../utils/withSSRauth";

export default function Dashboard(){

    const { user } = useContext(AuthContext);

    const userCanSeeMetrics = useCan({
        permissions: ['metrics.list']
    })

    useEffect(() => {
        api.get('/me')
        .then( response => console.log(response))
        .catch( error => console.error(error))
    },[]);

    return(
        <div>
            <h1>PAGINA DE DASHBOARD</h1>
            <h2>{user.email}</h2>
            { userCanSeeMetrics && <div> Métricas permitidas </div>}
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