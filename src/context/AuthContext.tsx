import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthUser } from '@/@type/auth';
import {
    login as authServiceLogin,
    register as authServiceRegister,
    logout as authServiceLogout,
    getStoredSession,
} from '@/integration/auth';
import { ApiError, parseApiError } from '@/utils/error-handler';

type AuthContextData = {
    isAuthenticated: boolean;
    user: AuthUser | null;
    isLoading: boolean;
    error: ApiError | null;
    signIn: (username: string, password: string) => Promise<boolean>;
    signUp: (username: string, password: string) => Promise<boolean>;
    signOut: () => Promise<void>;
    clearError: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode })  => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);

    // Carregar sessão armazenada no app load
    useEffect(() => {
        async function loadStorageData() {
            try {
                const storedSession = await getStoredSession();
                if (storedSession) {
                    setUser(storedSession);
                    setIsAuthenticated(true);
                }
            } catch (err) {
                console.log('Nenhuma sessão prévia encontrada');
            } finally {
                setIsLoading(false);
            }
        }
        loadStorageData();
    }, []);

    // Sign in com API
    async function signIn(username: string, password: string): Promise<boolean> {
        setIsLoading(true);
        setError(null);
        try {
            const authUser = await authServiceLogin(username, password);
            setUser(authUser);
            setIsAuthenticated(true);
            return true;
        } catch (err) {
            const apiError = parseApiError(err);
            setError(apiError);
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    // Sign up com API
    async function signUp(username: string, password: string): Promise<boolean> {
        setIsLoading(true);
        setError(null);
        try {
            const authUser = await authServiceRegister(username, password);
            setUser(authUser);
            setIsAuthenticated(true);
            return true;
        } catch (err) {
            const apiError = parseApiError(err);
            setError(apiError);
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    // Sign out com limpeza
    async function signOut() {
        setIsLoading(true);
        try {
            await authServiceLogout();
            setUser(null);
            setIsAuthenticated(false);
            setError(null);
        } catch (err) {
            console.error('Erro ao fazer logout:', err);
        } finally {
            setIsLoading(false);
        }
    }

    // Limpar erro
    function clearError() {
        setError(null);
    }

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user, 
            signIn, 
            signUp,
            signOut, 
            isLoading,
            error,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);