import { useForm, type SubmitHandler } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react'; // Ícones para um visual melhor
import { useState } from 'react';

// A lógica de validação e submit permanece a mesma
const loginSchema = z.object({
    email: z.email({ message: "Formato de e-mail inválido" }),
    password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const { login } = useAuth();
    const [apiError, setApiError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema)
    });

     const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
        setApiError(null); // Limpa erros anteriores antes de uma nova tentativa
        
        // 3. Chame a função login e aguarde o resultado
        const result = await login(data);

        // 4. Se o resultado não for de sucesso, atualize o estado de erro
        if (!result.success) {
            setApiError(result.message || 'Ocorreu um erro desconhecido.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-full">
            <div className="flex w-full max-w-4xl mx-auto overflow-hidden bg-primary rounded-lg shadow-lg">
                
                {/* --- Coluna de Branding (Esquerda) --- */ }
                {/* Esta coluna será escondida em telas pequenas (mobile-first) */ }
                <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center bg-secondary p-12 text-center">
                    <LogIn size={60} className="text-accent mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta!</h1>
                    <p className="text-text-secondary">Acesse o painel de administração para gerenciar sua aplicação.</p>
                </div>

                {/* --- Coluna do Formulário (Direita) --- */ }
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-white text-center mb-8">Acessar Painel</h2>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                         {apiError && (
                            <div className="flex items-center p-3 text-sm text-white bg-danger/20 border border-danger rounded-md">
                                <AlertCircle size={20} className="mr-3 text-danger" />
                                <span>{apiError}</span>
                            </div>
                        )}

                        {/* Campo de Email */ }
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail size={18} className="text-text-secondary" />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    placeholder="seu-email@exemplo.com"
                                    className="block w-full bg-secondary border border-secondary rounded-md py-2 pl-10 pr-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                                />
                            </div>
                            {errors.email && <p className="mt-2 text-sm text-danger">{errors.email.message}</p>}
                        </div>

                        {/* Campo de Senha */ }
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">Senha</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock size={18} className="text-text-secondary" />
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    placeholder="••••••••"
                                    className="block w-full bg-secondary border border-secondary rounded-md py-2 pl-10 pr-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                                />
                            </div>
                            {errors.password && <p className="mt-2 text-sm text-danger">{errors.password.message}</p>}
                        </div>

                        {/* Botão de Submit */ }
                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent disabled:bg-accent disabled:opacity-50 transition-all duration-300"
                            >
                                {isSubmitting ? 'Entrando...' : 'Entrar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;