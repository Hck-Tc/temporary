import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function OAuthsignup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleGoogleClick = async () => {
        try{
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);
            const result = await signInWithPopup(auth, provider);
            console.log(result);
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({name: result.user.displayName, email: result.user.email, photo: result.user.photoURL, type: 1})
            });
            const data = await res.json();
            dispatch(signInSuccess(data));
            navigate('/');
        } catch(error) {
            console.log('could not sign in with google', error);
        }
    };
  return (
    <button onClick={handleGoogleClick} type='button' style={{fontSize: 14, background: 'green'}}>Continue with Google</button>
  )
}
