import axios, { AxiosError} from 'axios';
import { parseCookies, setCookie } from 'nookies';

let cookies = parseCookies();

export const api = axios.create({
    baseURL: "http://localhost:3333/",
    headers: {
        Authorization: `Bearer ${cookies['nextauth.token']}`
    }
})


api.interceptors.response.use( response => {
    return response
}, (error: AxiosError) => {
    if(error.response?.status === 401) {
        if(error.response.data?.code === 'token.expired') {
            cookies = parseCookies(); //atualizando os cookies 

            const { 'nextauth.refreshToken': refreshToken } = cookies;

            api.post('/refresh', {
                refreshToken,
            }).then( response => {
                const {token} = response.data;


                setCookie(undefined, 'nextauth.token', token, {
                    maxAge: 60 * 60 * 24 * 30, // tempo máximo que o cookie ficará salvo  / 30 dias
                    path: '/' //quais caminhos da aplicação terão acesso ao Cookie  / nesse caso, todos os caminhos
                    
                });
                setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
                    maxAge: 60 * 60 * 24 * 30, // tempo máximo que o cookie ficará salvo  / 30 dias
                    path: '/' //quais caminhos da aplicação terão acesso ao Cookie  / nesse caso, todos os caminhos
                    
                });

                api.defaults.headers['Authorization'] = `Bearer ${token}`;

            })


        }
    } else {
        //deslogar o usuário
    }
;})