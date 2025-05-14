import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileSetup.css'; // Add this CSS file

function ProfileSetup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [job, setJob] = useState('');
  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = () => {
    const profileData = {
      name,
      email,
      phone,
      job,
      gender,
      interests,
      profilePic: profilePic ? URL.createObjectURL(profilePic) : null,
    };

    localStorage.setItem('profileData', JSON.stringify(profileData));
    navigate('/dashboard');
  };

  return (
    <div className="profile-container">
      <h1>👤 Setup Your Profile</h1>
      <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Phone Number:</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <label>Job / Profession:</label>
        <input type="text" value={job} onChange={(e) => setJob(e.target.value)} />

        <label>Gender:</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="nonbinary">Non-binary</option>
          <option value="prefer-not">Prefer not to say</option>
        </select>

        <label>Interests:</label>
        <textarea
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="E.g., coding, music, hiking..."
        />

        <label>Profile Picture:</label>
        <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} />

        <button type="button" onClick={handleSubmit}>
          Save Profile
        </button>
      </form>
    </div>
  );
}

export default ProfileSetup;
