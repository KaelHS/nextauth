import axios, { AxiosError} from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { singOut } from '../contexts/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';


let isRefreshing = false;

let failedRequestQueue = [];

export function setupAPIClient(ctx = undefined){

    let cookies = parseCookies(ctx);

    const api = axios.create({
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
                cookies = parseCookies(ctx); //atualizando os cookies 
    
                const { 'nextauth.refreshToken': refreshToken } = cookies;
    
                const originalConfig = error.config; //configurações do backend
    
                if(!isRefreshing) {
    
                    isRefreshing = true;
    
                    api.post('/refresh', {
                        refreshToken,
                    }).then( response => {
                        const {token} = response.data;
        
        
                        setCookie(ctx, 'nextauth.token', token, {
                            maxAge: 60 * 60 * 24 * 30, // tempo máximo que o cookie ficará salvo  / 30 dias
                            path: '/' //quais caminhos da aplicação terão acesso ao Cookie  / nesse caso, todos os caminhos
                            
                        });
                        setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 30, // tempo máximo que o cookie ficará salvo  / 30 dias
                            path: '/' //quais caminhos da aplicação terão acesso ao Cookie  / nesse caso, todos os caminhos
                            
                        });
        
                        api.defaults.headers['Authorization'] = `Bearer ${token}`;
    
                        failedRequestQueue.forEach( request => request.onSuccess(token))
                        failedRequestQueue = [];
        
                    }).catch(err =>{
                        failedRequestQueue.forEach( request => request.onFailure(err))
                        failedRequestQueue = [];
    
                        if(process.browser) {
                            singOut();
                        }
    
                    }).finally(() => {
                        isRefreshing = false;
                    })
        
                }
    
                return new Promise((resolve, reject) => {
                    failedRequestQueue.push({
                        onSuccess: (token: string) =>{
                            originalConfig.headers['Authorization'] = `Bearer ${token}`
    
                            resolve(api(originalConfig));
                        },
                        onFailure: (err: AxiosError) => {
    
                            reject(err);
                        }
                    })
                });
                }
        } else {
            if(process.browser) {
                singOut();
            } else {
                return Promise.reject(new AuthTokenError())
            }
        }
    
        return Promise.reject(error);
    ;})

    return api;
}