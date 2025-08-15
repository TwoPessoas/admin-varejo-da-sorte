import { createContext, useState, type ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // 1. Importe nossa instância do Axios
import { z } from 'zod'; // Precisamos do Zod aqui para tipar as credenciais

// Defina o tipo para as credenciais do formulário
const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});
type LoginCredentials = z.infer<typeof loginSchema>;


// Tipagem para o retorno da função login
interface LoginResult {
    success: boolean;
    message?: string;
}

// 2. Atualize a interface do contexto
interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (credentials: LoginCredentials) => Promise<LoginResult>; // A função agora recebe credenciais e é assíncrona
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AUTH_TOKEN_NAME_STORE = 'authTokenVeraoDaSorte';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Vamos inicializar o token a partir do localStorage para persistir o login
    const [token, setToken] = useState<string | null>(localStorage.getItem(AUTH_TOKEN_NAME_STORE));
    const navigate = useNavigate();

    // 3. Reescreva completamente a função de login
    const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
        try {
            // Faz a chamada POST para o endpoint de login da sua API
            const response = await api.post('/auth/login', credentials);

            // Se a API responder com sucesso (status 200-299)
            const { token: newToken } = response.data;

            if (newToken) {
                setToken(newToken);
                localStorage.setItem(AUTH_TOKEN_NAME_STORE, newToken);
                navigate('/dashboard'); // Redireciona para o dashboard após o login
                return { success: true };
            }

            // Caso a API responda com sucesso mas sem token (pouco provável)
            return { success: false, message: 'Token não recebido.' };

        } catch (error: any) {
            console.error("Falha no login:", error);

            // Lida com erros específicos da resposta da API
            if (error.response) {
                // Erro de "Não autorizado" (email ou senha errados)
                if (error.response.status === 401) {
                    return { success: false, message: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
                }
                // Outros erros vindos do servidor
                return { success: false, message: error.response.data.message || 'Ocorreu um erro no servidor.' };
            }

            // Erro de rede ou outro problema
            return { success: false, message: 'Não foi possível conectar ao servidor. Verifique sua conexão.' };
        }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem(AUTH_TOKEN_NAME_STORE);
        navigate('/login');
    };

    const value = {
        isAuthenticated: !!token,
        token,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};