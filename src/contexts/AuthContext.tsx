import { createContext, ReactNode, useEffect, useState } from "react";
import Router from 'next/router';
import { api } from "../services/apiClient";
import { setCookie, parseCookies, destroyCookie } from 'nookies';

type SingInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    singIn(credentials: SingInCredentials): Promise<void>;
    isAuthenticated: boolean;
    user: User;

}

type AuthProviderProps = {
    children: ReactNode;
}

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

export const AuthContext = createContext({} as AuthContextData);

export function singOut() {
    destroyCookie(undefined,'nextauth.token' );
    destroyCookie(undefined,'nextauth.refreshToken' );

    Router.push('/');
}

export function AuthProvider({children} : AuthProviderProps) {

    const [ user, setUser ] = useState<User>({} as User);
    const isAuthenticated = !!user;

    useEffect( () => {

        const {'nextauth.token': token } = parseCookies(); //retorna todos os cookies salvos

        if(token){
            api.get('/me')
            .then( response => {
                const { email, permissions, roles } = response.data;

                setUser({ email, permissions, roles });
            })
            .catch( () => {
                singOut();
            })
        }

    }, []);

    async function singIn({ email, password}: SingInCredentials) {
        try{
            const response = await api.post('sessions' , { 
                email,
                password,
            })

            const { token, refreshToken, permissions, roles } = response.data;

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // tempo máximo que o cookie ficará salvo  / 30 dias
                path: '/' //quais caminhos da aplicação terão acesso ao Cookie  / nesse caso, todos os caminhos
                
            });
            setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // tempo máximo que o cookie ficará salvo  / 30 dias
                path: '/' //quais caminhos da aplicação terão acesso ao Cookie  / nesse caso, todos os caminhos
                
            });

            setUser({
                email,
                permissions,
                roles
            })

            api.defaults.headers['Authorization'] = `Bearer ${token}`;

            Router.push('/dashboard');

        } catch (err){
            console.log(err)

        }

    }

    return(
        <AuthContext.Provider value={{singIn, isAuthenticated, user}}>
            {children}
        </AuthContext.Provider>
    );
}       