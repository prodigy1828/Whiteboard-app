import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [canvases, setCanvases] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // New states for sharing functionality
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingCanvasId, setSharingCanvasId] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareStatus, setShareStatus] = useState('');

  // New state for creating a canvas
  const [newCanvasName, setNewCanvasName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        navigate('/login');
        return;
      }
      try {
        // Fetch profile data
        const profileResponse = await fetch('http://localhost:3030/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const profileJSON = await profileResponse.json();
        if (profileResponse.ok) {
          setProfileData(profileJSON.user);
        } else {
          throw new Error(profileJSON.message);
        }

        // Fetch canvases
        const canvasResponse = await fetch('http://localhost:3030/canvas', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const canvasJSON = await canvasResponse.json();
        if (canvasResponse.ok) {
          setCanvases(canvasJSON);
        } else {
          throw new Error(canvasJSON.message);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch data');
        if (err.message.includes('unauthorized')) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profileData) {
    return <div className="loading">Loading...</div>;
  }

  const handleOpen = (canvasId) => {
    navigate(`/canvas/${canvasId}`);
  };

  const handleShare = (canvasId) => {
    setSharingCanvasId(canvasId);
    setShareEmail('');
    setShareStatus('');
    setShowShareModal(true);
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();

    if (!shareEmail) {
      setShareStatus('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareEmail)) {
      setShareStatus('Please enter a valid email address');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Sharing canvas:', { canvasId: sharingCanvasId, email: shareEmail }); // Debug log

      const response = await fetch(`http://localhost:3030/canvas/share/${sharingCanvasId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sharedWith: shareEmail, // Changed from shared_with to match backend expectation
        }),
      });

      const data = await response.json();
      console.log('Share response:', data); // Debug log

      if (response.ok) {
        setShareStatus('Canvas shared successfully!');
        setTimeout(() => setShowShareModal(false), 2000);
      } else {
        // More detailed error message
        const errorMessage = data.error || data.message || 'Failed to share canvas';
        setShareStatus(`Error: ${errorMessage}`);
        console.error('Share error details:', data); // Debug log
      }
    } catch (err) {
      console.error('Share error:', err);
      setShareStatus('Failed to share canvas. Please try again.');
    }
};

  const closeShareModal = () => {
    setShowShareModal(false);
    setSharingCanvasId(null);
    setShareEmail('');
    setShareStatus('');
  };

  // Function to handle canvas creation
  const handleCreateCanvas = async () => {
    if (!newCanvasName.trim()) {
      alert('Please enter a canvas name');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:3030/canvas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCanvasName }),
      });

      const data = await response.json();

      if (response.ok) {
        setCanvases([...canvases, data]); // Add the new canvas to the list
        setNewCanvasName(''); // Clear the input field
      } else {
        alert(`Error creating canvas: ${data.message || 'Failed to create canvas'}`);
      }
    } catch (err) {
      console.error('Canvas creation error:', err);
      alert('Failed to create canvas. Please try again.');
    }
  };

  // Add after other handler functions
  const handleDeleteCanvas = async (canvasId) => {
    if (!window.confirm('Are you sure you want to delete this canvas?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        navigate('/login');
        return;
      }

      console.log('Attempting to delete canvas:', canvasId); // Debug log

      const response = await fetch(`http://localhost:3030/canvas/erase/${canvasId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Log the raw response
      console.log('Delete response status:', response.status);
       
      // Try to get response text first to debug any non-JSON responses
      const rawResponse = await response.text();
      console.log('Raw response:', rawResponse);

      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid server response');
      }

      if (response.ok) {
        // Remove the deleted canvas from the state
        setCanvases(prevCanvases => prevCanvases.filter(canvas => canvas._id !== canvasId));
        alert('Canvas deleted successfully');
      } else {
        throw new Error(data.error || data.message || 'Failed to delete canvas');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Failed to delete canvas: ${err.message}`);
    }
};

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-info">
            <h2>Hello, {profileData.name}</h2>
            <p>Email: {profileData.email}</p>
          </div>
        </div>

        {/* Create Canvas Section */}
        <div className="create-canvas-section">
          <h3>Create New Canvas</h3>
          <div className="create-canvas-form">
            <input
              type="text"
              placeholder="Enter canvas name"
              value={newCanvasName}
              onChange={(e) => setNewCanvasName(e.target.value)}
              className="canvas-name-input"
            />
            <button className="btn btn-create btn-aesthetic" onClick={handleCreateCanvas}>
              + Create Canvas
            </button>
          </div>
        </div>

        <div className="canvas-section">
          <h3>Your Canvases</h3>
          {canvases.length === 0 ? (
            <p className="no-canvases">No canvases yet. Create your first one!</p>
          ) : (
            <ul className="canvas-list">
              {canvases.map((canvas) => (
                <li key={canvas._id} className="canvas-item">
                  <div className="canvas-info">
                    <span className="canvas-name">{canvas.name}</span>
                    <span className="canvas-date">
                      Created: {new Date(canvas.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="canvas-actions">
                    <button className="btn btn-open" onClick={() => handleOpen(canvas._id)}>
                      Open
                    </button>
                    <button className="btn btn-share" onClick={() => handleShare(canvas._id)}>
                      Share
                    </button>
                    <button className="btn btn-delete" onClick={() => handleDeleteCanvas(canvas._id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay">
          <div className="share-modal">
            <h3>Share Canvas</h3>
            <form onSubmit={handleShareSubmit}>
              <div className="form-group">
                <label htmlFor="shareEmail">Email:</label>
                <input
                  type="email"
                  id="shareEmail"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              {shareStatus && (
                <p
                  className={
                    shareStatus.includes('Error') ? 'error-message' : 'success-message'
                  }
                >
                  {shareStatus}
                </p>
              )}
              <div className="modal-actions">
                <button type="button" onClick={closeShareModal} className="btn btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn btn-confirm">
                  Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;