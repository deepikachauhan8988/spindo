import React, { useState } from 'react';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import "../assets/css/registration.css";

// API base URL - you may want to move this to a config file
const API_BASE_URL = 'http://localhost:8000'; // Update this with your actual API base URL

function Registration() {
  const [formData, setFormData] = useState({
    username: '',
    mobile_number: '',
    state: '',
    district: '',
    block: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = 'Mobile number must be 10 digits';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }
    
    if (!formData.block.trim()) {
      newErrors.block = 'Block is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Create the payload as specified
      const payload = {
        username: formData.username,
        mobile_number: formData.mobile_number,
        state: formData.state,
        district: formData.district,
        block: formData.block,
        password: formData.password
      };
      
      // Make real API call to customer registration endpoint
      const response = await axios.post(
        `${API_BASE_URL}/api/customer/register/`,
        payload
      );
      
      setServerResponse(response.data);
      setRegistrationSuccess(true);
      setIsLoading(false);
      
      console.log('Payload sent:', payload);
      console.log('Server response:', response.data);
    } catch (error) {
      console.error('Registration error:', error);
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status (4xx, 5xx)
        setServerResponse({
          success: false,
          message: error.response.data?.message || 'Registration failed. Please try again.',
          error: error.response.data
        });
      } else if (error.request) {
        // No response received from server
        setServerResponse({
          success: false,
          message: 'No response from server. Please check your internet connection.'
        });
      } else {
        // Request setup error
        setServerResponse({
          success: false,
          message: 'Error setting up request. Please try again.'
        });
      }
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      mobile_number: '',
      state: '',
      district: '',
      block: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setRegistrationSuccess(false);
    setServerResponse(null);
  };

  return (
    <div className="registration-page">
      <Container className='box-container'>
        <h2 className="text-center mb-4">Create Account</h2>
        <p className="text-center text-muted mb-4">Join us today by creating a new account</p>
        
        {serverResponse && !registrationSuccess && !serverResponse.success && (
          <Alert variant="danger" className="text-center">
            <Alert.Heading>Registration Failed!</Alert.Heading>
            <p>{serverResponse.message}</p>
            {serverResponse.error && (
              <div className="mt-2">
                <strong>Error details:</strong>
                <pre className="mt-1 text-left small">{JSON.stringify(serverResponse.error, null, 2)}</pre>
              </div>
            )}
          </Alert>
        )}

        {registrationSuccess && (
          <div className="success-message">
            <Alert variant="success" className="text-center">
              <Alert.Heading>Registration Successful!</Alert.Heading>
              <p>{serverResponse?.message || 'Your account has been created successfully.'}</p>
              {serverResponse?.data && (
                <div>
                  <hr />
                  <p className="mb-0">
                    {serverResponse.data.id && (
                      <React.Fragment>
                        <strong>User ID:</strong> {serverResponse.data.id}<br />
                      </React.Fragment>
                    )}
                    {serverResponse.data.username && (
                      <React.Fragment>
                        <strong>Username:</strong> {serverResponse.data.username}<br />
                      </React.Fragment>
                    )}
                    {serverResponse.data.mobile_number && (
                      <React.Fragment>
                        <strong>Mobile:</strong> {serverResponse.data.mobile_number}<br />
                      </React.Fragment>
                    )}
                    {(serverResponse.data.block || serverResponse.data.district || serverResponse.data.state) && (
                      <React.Fragment>
                        <strong>Location:</strong> {[serverResponse.data.block, serverResponse.data.district, serverResponse.data.state].filter(Boolean).join(', ')}
                      </React.Fragment>
                    )}
                  </p>
                </div>
              )}
            </Alert>
            <Button variant="primary" onClick={resetForm} className="w-100">
              Register Another Account
            </Button>
          </div>
        )}

        {!registrationSuccess && (!serverResponse || serverResponse.success) && (
           <Form onSubmit={handleSubmit}>
         <Row>
               <Col md={3} lg={3} sm={12}> 
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label className='spi-label'>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                isInvalid={!!errors.username}
                placeholder="Enter your full name"
                className='spi-control'
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </Form.Group>
</Col>
 <Col md={3} lg={3} sm={12}> 
            <Form.Group className="mb-3" controlId="formMobile">
              <Form.Label className='spi-label'>Mobile Number</Form.Label>
              <Form.Control
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                isInvalid={!!errors.mobile_number}
                placeholder="Enter 10-digit mobile number"
                className='spi-control'
              />
              <Form.Control.Feedback type="invalid">
                {errors.mobile_number}
              </Form.Control.Feedback>
            </Form.Group>
</Col>
            
              <Col md={3} lg={3} sm={12}> 
                 <Form.Group className="mb-3" controlId="formState">
                   <Form.Label className='spi-label'>State</Form.Label>
                   <Form.Control
                     type="text"
                     name="state"
                     value={formData.state}
                     onChange={handleChange}
                     isInvalid={!!errors.state}
                     placeholder="State"
                     className='spi-control'
                   />
                   <Form.Control.Feedback type="invalid">
                     {errors.state}
                   </Form.Control.Feedback>
                 </Form.Group>
               </Col>
               
              <Col md={3} lg={3} sm={12}> 
                 <Form.Group className="mb-3" controlId="formDistrict">
                   <Form.Label className='spi-label'>District</Form.Label>
                   <Form.Control
                     type="text"
                     name="district"
                     value={formData.district}
                     onChange={handleChange}
                     isInvalid={!!errors.district}
                     placeholder="District"
                     className='spi-control'
                   />
                   <Form.Control.Feedback type="invalid">
                     {errors.district}
                   </Form.Control.Feedback>
                 </Form.Group>
               </Col>
               
              <Col md={3} lg={3} sm={12}> 
                 <Form.Group className="mb-3" controlId="formBlock">
                   <Form.Label className='spi-label'>Block</Form.Label>
                   <Form.Control
                     type="text"
                     name="block"
                     value={formData.block}
                     onChange={handleChange}
                     isInvalid={!!errors.block}
                     placeholder="Block"
                     className='spi-control'
                   />
                   <Form.Control.Feedback type="invalid">
                     {errors.block}
                   </Form.Control.Feedback>
                 </Form.Group>
               </Col>
            
<Col md={3} lg={3} sm={12}> 
            <Form.Group className="mb-3 " controlId="formPassword">
              <Form.Label className='spi-label'>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
                placeholder="Enter password"
                className='spi-control'
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
</Col>
<Col md={3} lg={3} sm={12}>
            <Form.Group className="mb-4" controlId="formConfirmPassword">
              <Form.Label className='spi-label'>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                isInvalid={!!errors.confirmPassword}
                placeholder="Confirm password"
                className='spi-control'
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>
            </Col>
            <div className='text-center'>
            <Button 
              variant="primary" 
              type="submit" 
              className=" register-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>
</div>
            <div className="text-center mt-3">
              <span className="text-muted">Already have an account? </span>
              <a href="/Login" className="text-primary text-decoration-none">Sign In</a>
            </div>
               </Row>
          </Form>
       
        )}
      </Container>
    </div>
  );
}

export default Registration;