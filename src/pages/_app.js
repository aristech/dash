import '@/styles/globals.css'
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { ThemeProvider as ThemeStyledComponentsProvider } from 'styled-components';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { registerLicense } from '@syncfusion/ej2-base';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import theme from '@/theme/theme';

import { SessionProvider } from "next-auth/react"


registerLicense('Mgo+DSMBaFt+QHJqUU1hXk5Hd0BLVGpAblJ3T2ZQdVt5ZDU7a15RRnVfR1xjSXdSdUVrWHpbcQ==;Mgo+DSMBPh8sVXJ1S0R+WFpFdEBBXHxAd1p/VWJYdVt5flBPcDwsT3RfQF5jTH9TdkxiWn9WcnVVRw==;ORg4AjUWIQA/Gnt2VFhiQlVPd11dXmJWd1p/THNYflR1fV9DaUwxOX1dQl9gSXtSdkVqWHxeeHZXTmE=;MTk5NjAzOEAzMjMxMmUzMjJlMzRPeWxZM25HeGhlZWpvVjg5UW96ZVc4M3hBbTA4eVB1S0ZYRkJwUWZlY01BPQ==;MTk5NjAzOUAzMjMxMmUzMjJlMzRXMVVKSExpM0lrbW9STWRlRklYeENxOEVWZjM1U0ZaU3VPS0ltVGVRcC9ZPQ==;NRAiBiAaIQQuGjN/V0d+Xk9AfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5Wd0VjUH5dcHxWRGdd;MTk5NjA0MUAzMjMxMmUzMjJlMzRCK2t0RFlmR3pueUpuUTBadGVxTWNpcUl6L0pUWmhiUjM1R3FabjVSYWZvPQ==;MTk5NjA0MkAzMjMxMmUzMjJlMzRURnlpcVZ6N1MvNlpiVHpqeXZGNllHRUZNZXJQTFdEenVHRWY2a1hNWm1NPQ==;Mgo+DSMBMAY9C3t2VFhiQlVPd11dXmJWd1p/THNYflR1fV9DaUwxOX1dQl9gSXtSdkVqWHxeeHBUQmE=;MTk5NjA0NEAzMjMxMmUzMjJlMzRYL3ZFZkRDV0E1WTV1c1lFRlZOekplSG9QUlliWnRwOVdJNGVYV1N0bE9jPQ==;MTk5NjA0NUAzMjMxMmUzMjJlMzRtL3h0R3RIOXlFanFkTkhyenB3Q29iVEE1elN5b0dOclR0ZVVGMCtpVXhBPQ==;MTk5NjA0NkAzMjMxMmUzMjJlMzRCK2t0RFlmR3pueUpuUTBadGVxTWNpcUl6L0pUWmhiUjM1R3FabjVSYWZvPQ==')

function App({ Component, pageProps: {session, pageProps} }) {


    
    return (
            <Provider store={store}>
                    <ThemeStyledComponentsProvider theme={theme}>
                        <ThemeProvider theme={theme}>
                            
                            <SessionProvider session={session}>
                                <ToastContainer
                                    position="top-center"
                                    autoClose={1200}
                                    hideProgressBar={false}
                                    newestOnTop={false}
                                    closeOnClick
                                    rtl={false}
                                    pauseOnFocusLoss
                                    draggable
                                    pauseOnHover
                                    theme="light"
                                />
                                <Component {...pageProps} />\
                            </SessionProvider>
                           
                        </ThemeProvider>
                    </ThemeStyledComponentsProvider>
            </Provider>
    )
}



  

  export default App;