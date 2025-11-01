import { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { z } from 'zod';
import toast from 'react-hot-toast';

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
    login: (credentials: LoginCredentials) => Promise<LoginResult>;
    logout: (showMessage?: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AUTH_TOKEN_NAME_STORE = 'authTokenVeraoDaSorte';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem(AUTH_TOKEN_NAME_STORE));
    const [isValidating, setIsValidating] = useState(true);
    const navigate = useNavigate();

    // Validate token on app start
    useEffect(() => {
        const validateToken = async () => {
            const storedToken = localStorage.getItem(AUTH_TOKEN_NAME_STORE);
            if (!storedToken) {
                setIsValidating(false);
                return;
            }

            try {
                await api.get('/auth/validate');
                setToken(storedToken);
            } catch (error) {
                localStorage.removeItem(AUTH_TOKEN_NAME_STORE);
                setToken(null);
                toast.error('Sessão expirada. Faça login novamente.');
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, []);

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

    const logout = (showMessage = false) => {
        setToken(null);
        localStorage.removeItem(AUTH_TOKEN_NAME_STORE);
        if (showMessage) {
            // Message will be shown by the API interceptor
        }
        navigate('/login');
    };

    const value = {
        isAuthenticated: !!token && !isValidating,
        token,
        login,
        logout,
    };

    // Show loading while validating token
    if (isValidating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};