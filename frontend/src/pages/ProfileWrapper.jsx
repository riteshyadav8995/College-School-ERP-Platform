import { useSelector } from 'react-redux';
import StudentProfile from './StudentProfile';
import TeacherProfile from './TeacherProfile';
import { Navigate } from 'react-router-dom';

function ProfileWrapper() {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" />;

  if (user.role === 'teacher') {
    return <TeacherProfile />;
  } else if (user.role === 'student') {
    return <StudentProfile />;
  }

  // Fallback for admins if they try to access profile, though they might not have it in the sidebar
  return <div className="p-8 text-center text-slate-500">Profiles are only available for Students and Teachers.</div>;
}

export default ProfileWrapper;
