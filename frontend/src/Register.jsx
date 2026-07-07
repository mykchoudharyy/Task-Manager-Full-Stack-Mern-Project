import { useState } from 'react';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault(); 
        try {
            const response = await fetch('https://task-manager-p7q1.onrender.com/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            });
            const data = await response.json();
            if (data.success) {
                alert('Registration Successful! You can now log in.');
            } else {
                alert('Oops! ' + data.message);
            }
        } catch (error) {
            console.log("Error:", error);
            alert('Server se connect nahi ho paya.');
        }
    };

    return (
        <div style={{ border: '2px solid #ccc', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
            <h2>Create a New Account</h2>
            <form onSubmit={handleRegister}>
                <input 
                    type="email" 
                    placeholder="Enter Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={{ padding: '8px', margin: '10px 0', width: '200px' }}
                />
                <br />
                <input 
                    type="password" 
                    placeholder="Enter Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    style={{ padding: '8px', margin: '10px 0', width: '200px' }}
                />
                <br />
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '10px' }}>Register</button>
            </form>
        </div>
    );
}

export default Register;