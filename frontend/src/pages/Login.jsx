const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      const userData = res.data.user || {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      };
      if (!res.data.token || !userData?.email) {
        throw new Error('Invalid server response');
      }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      if (setUser) setUser(userData);
      navigate('/pto/apply');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };