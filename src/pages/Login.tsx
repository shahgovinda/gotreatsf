import React, { useState } from 'react'
import Button from '../components/Button'
import { useNavigate } from 'react-router-dom'
import { handleEmailAccountLogin, handlesignInWithGoogle } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../config/firebaseConfig'

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("")
    const user = useAuthStore((state) => state.user)
    const userDetails = useAuthStore((state) => state.user)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await handleEmailAccountLogin(email, password);
            navigate("/")
        } catch (error) {
            console.error(error?.message);
            setErrorMsg(error?.message);
            setError("Invalid email or password");
        }
    };

    const navigate = useNavigate()

    console.log("google login", user);

    // const sentOtp = async () => {
    //     try {
    //         const recaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', {});
    //         const conformationResult = await signInWithPhoneNumber(auth, '+91' + phone, recaptcha);
    //         console.log("conformationResult", conformationResult);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    return (
        <div className='flex justify-center items-center h-[calc(100vh-150px)]'>
            <div className=''>
                <div className="text-sm font-medium text-center  text-gray-500 border-b border-gray-300 ">
                    <ul className="flex justify-center gap-4 text-lg ">
                        <li className="me-2">
                            <p className="inline-block p-4 text-green-500 border-b-2 border-green-500 rounded-t-lg active " aria-current="page">Login</p>
                        </li>
                        <li className="me-2" onClick={() => navigate('/register')}>
                            <p className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 ">Register</p>
                        </li>
                    </ul>
                </div>

                {/* <div className='my-10 flex flex-col items-center gap-2'>
                    <p className='mb-2 text-orange-600 text-sm'>Phone Number</p>
                    <input type="number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className='border border-gray-300 rounded-xl p-2 w-full' placeholder='Enter your Phone' />
                    <Button onClick={sentOtp}>Get OTP</Button>
                    <div className='mt-5' id='recaptcha-container'>

                    </div>
                    <input type="number"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className='border border-gray-300 rounded-xl p-2 w-full' placeholder='Enter your OTP' />
                    <Button onClick={sentOtp}>Verify OTP</Button>
                </div> */}

                <form className='mt-10 w-74 space-y-4' onSubmit={handleSubmit}>
                    <div>
                        <p className='mb-2 text-orange-600 text-sm'>Email</p>
                        <input type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='border border-gray-300 rounded-xl p-2 w-full' placeholder='Enter your Email' />
                    </div>
                    <div>
                        <p className='mb-2 text-orange-600 text-sm'>Password</p>
                        <input type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='border border-gray-300 rounded-xl p-2 w-full' placeholder='Enter your password' />
                    </div>
                    {/* <div>
                <p className='mb-2 text-orange-600 text-sm'>Address</p>
                <textarea rows={3} className='border border-gray-300 rounded-xl p-2 w-full' placeholder='Enter your full address' />
            </div> */}
                    {error && <p className='text-red-500 text-center'>{error} <br /> {errorMsg}</p>}
                    <button type='submit' className='auth-button auth-login-btn'>Log In</button>
                    <p className='text-center'>Or</p>
                </form>
                <button
                    type='button'
                    onClick={async () => {
                        await handlesignInWithGoogle();
                        navigate("/");
                    }}
                    className='auth-button auth-google-btn'>
                    <img src="/google.svg" className='w-5' alt="" />
                    Sign In With Google
                </button>

            </div>

        </div>
    )
}

export default Login