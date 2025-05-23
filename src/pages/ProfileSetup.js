import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileSetup.css';

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
    if (!name || !email) {
      alert('Name and Email are required!');
      return;
    }

    const profileData = {
      name,
      email,
      phone,
      job,
      gender,
      interests,
      image: null,
    };

    if (profilePic) {
      // Validate image size (max 2MB)
      if (profilePic.size > 2 * 1024 * 1024) {
        alert('Image size exceeds 2MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        profileData.image = reader.result; // Base64 string
        localStorage.setItem('profileData', JSON.stringify(profileData));
        navigate('/dashboard');
      };
      reader.onerror = () => {
        alert('Failed to read the image file. Please try another image.');
      };
      reader.readAsDataURL(profilePic);
    } else {
      localStorage.setItem('profileData', JSON.stringify(profileData));
      navigate('/dashboard');
    }
  };

  return (
    <div className="profile-setup-wrapper">
      <div className="profile-setup-container">
        <h1>👤 Setup Your Profile</h1>
        <form className="profile-setup-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number:</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="job">Job / Profession:</label>
            <input
              type="text"
              id="job"
              value={job}
              onChange={(e) => setJob(e.target.value)}
              placeholder="Enter your profession"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender:</label>
            <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="nonbinary">Non-binary</option>
              <option value="prefer-not">Prefer not to say</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="interests">Interests:</label>
            <textarea
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="E.g., coding, music, hiking..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="profilePic">Profile Picture:</label>
            <input
              type="file"
              id="profilePic"
              accept="image/*"
              onChange={(e) => setProfilePic(e.target.files[0])}
            />
            {profilePic && (
              <div className="profile-pic-preview">
                <img src={URL.createObjectURL(profilePic)} alt="Preview" />
              </div>
            )}
          </div>

          <button type="button" onClick={handleSubmit}>
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetup;