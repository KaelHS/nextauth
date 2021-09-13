import { setupAPIClient } from "../services/api";
import { withSSRauth } from "../utils/withSSRauth";

export default function Metrics(){


    return(
        <div>
            <h1>PAGINA DE METRICAS</h1>
        </div>
    );
}

export const GetServerSideProps = withSSRauth( async(ctx) =>{
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get('/me');

    return {
        props:{}
    }
}, {
    permissions: ['metrics.lists'],
    roles: ['administrator'],
})