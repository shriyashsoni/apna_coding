import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router';
import {useAuth} from '../../src/hooks/use-auth';
import {useAdmin} from '../../src/hooks/useAdmin';
import {Navbar} from '../../src/components/Navbar';
import {Toaster} from '../../src/components/ui/sonner';
import '../../src/index.css';
function App(){const auth=useAuth(),admin=useAdmin();return <BrowserRouter><Navbar/><main className="pt-32 p-6"><h1>Session regression</h1><pre id="state">{JSON.stringify({loading:auth.isLoading,authenticated:auth.isAuthenticated,signingOut:auth.isSigningOut,user:auth.user,admin:admin.isAdmin})}</pre><button onClick={()=>auth.signOut().catch(()=>{})}>Test sign out</button></main><Toaster/></BrowserRouter>};createRoot(document.getElementById('root')!).render(<App/>);
