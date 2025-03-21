import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Board from '../components/Board';
import Toolbar from '../components/Toolbar';
import Toolbox from '../components/Toolbox';
import BoardProvider from '../store/BoardProvider';
import ToolboxProvider from '../store/ToolboxProvider';
import { updateCanvas, loadCanvas } from '../utils/api';
import './Canvas.css';

function Canvas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [canvasData, setCanvasData] = useState(null);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [history, setHistory] = useState([]); // Add history state

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3030');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Join canvas room when socket and canvas ID are available
  useEffect(() => {
    if (socket && id) {
      socket.emit('join-canvas', id);
    }
  }, [socket, id]);

  // Listen for canvas updates from other users
  useEffect(() => {
    if (socket) {
      const handleCanvasUpdate = (updatedElements) => {
        setCanvasData(prevData => ({
          ...prevData,
          elements: updatedElements
        }));
      };

      socket.on('canvas-updated', handleCanvasUpdate);

      return () => {
        socket.off('canvas-updated', handleCanvasUpdate);
      };
    }
  }, [socket]);

  useEffect(() => {
    const fetchCanvas = async () => {
      try {
        const data = await loadCanvas(id);
        setCanvasData(data);
      } catch (err) {
        console.error('Error loading canvas:', err);
        setError(err.message);
      }
    };

    fetchCanvas();
  }, [id]);

  const handleCanvasChange = useCallback(async (updatedElements) => {
    if (!updatedElements) return;
    
    try {
      // Add current elements to history before updating
      setHistory(prev => [...prev, canvasData.elements]);

      // Update local state immediately
      setCanvasData(prevData => ({
        ...prevData,
        elements: updatedElements,
      }));

      // Emit canvas update to other users
      socket?.emit('canvas-update', {
        canvasId: id,
        elements: updatedElements
      });

      // Debounce the API call to save changes
      const timeoutId = setTimeout(async () => {
        try {
          const data = await updateCanvas(id, updatedElements);
          console.log('Canvas updated successfully:', data);
        } catch (error) {
          console.error('Failed to save canvas:', error);
        }
      }, 1000); // Increased debounce time

      return () => clearTimeout(timeoutId);
    } catch (err) {
      console.error('Error updating canvas:', err);
      setError(err.message);
    }
  }, [id, socket, canvasData]);

  // Add undo function
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    const previousElements = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    
    setCanvasData(prevData => ({
      ...prevData,
      elements: previousElements
    }));

    // Emit the undo to other users
    socket?.emit('canvas-update', {
      canvasId: id,
      elements: previousElements
    });
  }, [history, id, socket]);

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/profile')}>Back to Profile</button>
      </div>
    );
  }

  if (!canvasData) {
    return <div className="loading">Loading canvas...</div>;
  }

  return (
    <div className="canvas-container">
      <BoardProvider 
        initialElements={canvasData.elements}
        onUndo={handleUndo}
      >
        <ToolboxProvider>
          <Toolbar />
          <Board 
            onCanvasChange={handleCanvasChange}
          />
          <Toolbox />
        </ToolboxProvider>
      </BoardProvider>
    </div>
  );
}

export default Canvas;