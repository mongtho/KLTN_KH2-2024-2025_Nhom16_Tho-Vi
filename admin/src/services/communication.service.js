import api from './api';

const API_PATH = '/communications';

const getAllCommunications = () => {
  return api.get(API_PATH);
};

const getCommunicationById = (id) => {
  return api.get(`${API_PATH}/${id}`);
};

const createCommunication = (communicationData) => {
  const payload = {
    title: communicationData.title,
    type: communicationData.type,
    content: communicationData.content,
    imageUrl: communicationData.imageUrl || null,
    office: { id: communicationData.office.id },
    author: communicationData.author
  };
  // remove undefined/null fields if necessary before sending
  return api.post(API_PATH, payload);
};

const updateCommunication = (id, communicationData) => {
  const payload = {
    title: communicationData.title,
    type: communicationData.type,
    content: communicationData.content,
    imageUrl: communicationData.image || communicationData.imageUrl || null,
    office: { id: communicationData?.officeId },
    status: communicationData.status
  };
  return api.put(`${API_PATH}/${id}`, payload);
};

const deleteCommunication = (id) => {
  return api.delete(`${API_PATH}/${id}`);
};

const approveCommunication = (id) => {
  return api.post(`${API_PATH}/${id}/approve`);
};

const rejectCommunication = (id, reason) => {
  return api.post(`${API_PATH}/${id}/reject`, { reason });
};

const unapproveCommunication = (id, reason) => {
  return api.post(`${API_PATH}/${id}/unapprove`, { reason });
};

// Optional: Submit for approval
const submitForApproval = (id) => {
  return api.post(`${API_PATH}/${id}/submit`);
};

// Optional: Increment shares
const incrementShares = (id) => {
  return api.post(`${API_PATH}/${id}/share`);
};


const communicationService = {
  getAllCommunications,
  getCommunicationById,
  createCommunication,
  updateCommunication,
  deleteCommunication,
  approveCommunication,
  rejectCommunication,
  unapproveCommunication,
  submitForApproval, // Export if used
  incrementShares, // Export if used
};

export default communicationService; 