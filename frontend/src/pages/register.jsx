const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/register', form);
      const userData = res.data.user || {
        _id: res.data._id,
        name: res.data.name || form.name,
        email: res.data.email || form.email,
        role: res.data.role || form.role,
      };
      if (!res.data.token || !userData?.email) {
        throw new Error('Invalid server response');
      }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      if (setUser) setUser(userData);
      navigate('/pto/apply');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };