import '@/styles/globals.css'
import "primeflex/primeflex.css";
import { Provider } from 'react-redux';
import { SessionProvider } from "next-auth/react"
import { store } from '@/store';
import theme from '@/theme/theme';
import { ThemeProvider } from 'styled-components';
import { PersistGate } from 'redux-persist/integration/react'
import {persistStore} from 'redux-persist'
import { ToastProvider } from '@/_context/ToastContext';

let persistor = persistStore(store)


function App({ Component, pageProps: {session, pageProps} }) {
    return (
        <Provider store={store}>
            <ToastProvider>
             <PersistGate loading={null} persistor={persistor}>
        <SessionProvider session={session}>
            <ThemeProvider theme={theme}>
            <Component {...pageProps} />
            </ThemeProvider>
        </SessionProvider>
        </PersistGate>
        </ToastProvider>
        </Provider>
    )
}




export default App;