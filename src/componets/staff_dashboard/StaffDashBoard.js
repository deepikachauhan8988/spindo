import React, { useState, useEffect } from "react";
import { Container, Table, Spinner, Alert, Row, Col, Card, Button, Dropdown } from "react-bootstrap";
import "../../assets/css/admindashboard.css";
import StaffLeftNav from "./StaffLeftNav";
import StaffHeader from "./StaffHeader";
import "../../assets/css/table.css";
import { useAuth } from "../context/AuthContext";
import axios from "axios"; // Import axios to match TotalRegistration

const StaffDashBoard = () => {
  // Check device width
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Vendor and Customer data state
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTable, setActiveTable] = useState("vendors"); // "vendors" or "customers"
  
  // Get auth context - similar to TotalRegistration
  const { tokens, isLoading: authLoading, refreshAccessToken, logout } = useAuth();

  // API URLs - similar structure to TotalRegistration
  const VENDOR_API_URL = "https://mahadevaaya.com/spindo/spindobackend/api/vendor/register/";
  const CUSTOMER_API_URL = "https://mahadevaaya.com/spindo/spindobackend/api/customer/register/";

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch vendor and customer data from APIs - using axios like TotalRegistration
  const fetchData = async () => {
    if (!tokens?.access || !tokens?.refresh) {
      setLoading(false);
      setError("Authentication required. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Set up authorization headers - similar to TotalRegistration
      const headers = {
        headers: { Authorization: `Bearer ${tokens.access}` }
      };

      // Fetch vendors using axios
      const vendorResponse = await axios.get(VENDOR_API_URL, headers);
      
      if (vendorResponse.data.status) {
        setVendors(vendorResponse.data.data || []);
      } else {
        throw new Error("Failed to fetch vendor data");
      }

      // Fetch customers using axios
      const customerResponse = await axios.get(CUSTOMER_API_URL, headers);
      
      if (customerResponse.data.status) {
        setCustomers(customerResponse.data.data || []);
      } else {
        throw new Error("Failed to fetch customer data");
      }
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message);
      
      // Check if access token is expired (status code 401)
      if (err.response?.status === 401) {
        console.log("Access token expired, attempting to refresh...");
        const newAccessToken = await refreshAccessToken(tokens.refresh);
        
        if (newAccessToken) {
          // Retry fetch with new access token
          return fetchData();
        } else {
          setError("Session expired. Please log in again.");
        }
      } else {
        setError(err.response?.data?.detail || err.message || "Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [tokens.access, authLoading]);

  // Calculate counts for cards
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(vendor => vendor.is_active).length;
  const inactiveVendors = totalVendors - activeVendors;
  
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(customer => customer.is_active).length;
  const inactiveCustomers = totalCustomers - activeCustomers;
  
  // Handle card click
  const handleCardClick = (tableType) => {
    setActiveTable(tableType);
    setShowTable(true);
    setActiveFilter("all"); // Reset filter when switching tables
  };
  
  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setShowTable(true);
  };
  
  // Filter data based on active filter and table type
  const filteredData = activeTable === "vendors" 
    ? (activeFilter === "all" 
       ? vendors 
       : activeFilter === "active"
       ? vendors.filter(vendor => vendor.is_active)
       : vendors.filter(vendor => !vendor.is_active))
    : (activeFilter === "all" 
       ? customers 
       : activeFilter === "active"
       ? customers.filter(customer => customer.is_active)
       : customers.filter(customer => !customer.is_active));

  // Refresh data function - similar to TotalRegistration's fetchStaff
  const handleRefresh = () => {
    fetchData();
  };

  return (
    <>
      <div className="dashboard-container">
        {/* Left Sidebar */}
        <StaffLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* Main Content */}
        <div className="main-content-dash">
          <StaffHeader toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-body dashboard-main-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Vendor Dashboard</h2>
              <Button variant="outline-primary" size="sm" onClick={handleRefresh}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh Data
              </Button>
            </div>
            
            {/* Auth Loading State */}
            {authLoading && (
              <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <Spinner animation="border" variant="primary" />
                <span style={{ marginLeft: '10px' }}>Loading session...</span>
              </div>
            )}

            {/* Data Loading State */}
            {!authLoading && loading && (
              <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <Spinner animation="border" variant="primary" />
                <span style={{ marginLeft: '10px' }}>Loading data...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="danger" className="mt-4">
                <Alert.Heading>Error fetching data</Alert.Heading>
                <p>{error}</p>
                <hr />
                <div className="d-flex justify-content-end">
                  <Button onClick={handleRefresh} variant="outline-danger">
                    Try Again
                  </Button>
                </div>
              </Alert>
            )}

            {/* Dashboard Cards with Filter Dropdown */}
            {!authLoading && !loading && !error && (
              <>
                <Row className="mb-4">
                  <Col md={6} className="mb-3">
                    <Card 
                      className="dashboard-card h-100 cursor-pointer"
                      onClick={() => handleCardClick("vendors")}
                    >
                      <Card.Body className="text-center">
                        <Card.Title className="card-title">Total Vendors</Card.Title>
                        <h2 className="card-number">{totalVendors}</h2>
                        <div className="mt-2">
                          <span className="text-success me-3">Active: {activeVendors}</span>
                          <span className="text-danger">Inactive: {inactiveVendors}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Card 
                      className="dashboard-card h-100 cursor-pointer"
                      onClick={() => handleCardClick("customers")}
                    >
                      <Card.Body className="text-center">
                        <Card.Title className="card-title">Total Customers</Card.Title>
                        <h2 className="card-number">{totalCustomers}</h2>
                        <div className="mt-2">
                          <span className="text-success me-3">Active: {activeCustomers}</span>
                          <span className="text-danger">Inactive: {inactiveCustomers}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                
                <Row className="mb-4">
                  <Col md={6} className="mb-3">
                    <Dropdown>
                      <Dropdown.Toggle variant="primary" id="filter-dropdown">
                        Filter: {activeFilter === "all" ? `All ${activeTable === "vendors" ? "Vendors" : "Customers"}` : 
                               activeFilter === "active" ? `Active ${activeTable === "vendors" ? "Vendors" : "Customers"}` : `Inactive ${activeTable === "vendors" ? "Vendors" : "Customers"}`}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleFilterChange("all")}>
                          All {activeTable === "vendors" ? "Vendors" : "Customers"}
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleFilterChange("active")}>
                          Active {activeTable === "vendors" ? "Vendors" : "Customers"}
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleFilterChange("inactive")}>
                          Inactive {activeTable === "vendors" ? "Vendors" : "Customers"}
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Col>
                </Row>

                {/* Data Table */}
                {showTable && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3>
                        {activeFilter === "all" && `All ${activeTable === "vendors" ? "Vendors" : "Customers"}`}
                        {activeFilter === "active" && `Active ${activeTable === "vendors" ? "Vendors" : "Customers"}`}
                        {activeFilter === "inactive" && `Inactive ${activeTable === "vendors" ? "Vendors" : "Customers"}`}
                      </h3>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setShowTable(false)}
                      >
                        Close Table
                      </Button>
                    </div>
                    
                    {filteredData.length > 0 ? (
                      <Table striped bordered hover responsive>
                        <thead className="table-thead">
                          <tr>
                            <th>#</th>
                            <th>Unique ID</th>
                            <th>Username</th>
                            <th>Mobile Number</th>
                            <th>State</th>
                            <th>District</th>
                            <th>Block</th>
                            {activeTable === "vendors" && (
                              <>
                                <th>Email</th>
                                <th>Category</th>
                              </>
                            )}
                            <th>Active</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((item, index) => (
                            <tr key={item.id}>
                              <td>{index + 1}</td>
                              <td>{item.unique_id}</td>
                              <td>{item.username}</td>
                              <td>{item.mobile_number}</td>
                              <td>{item.state}</td>
                              <td>{item.district}</td>
                              <td>{item.block}</td>
                              {activeTable === "vendors" && (
                                <>
                                  <td>{item.email}</td>
                                  <td>{item.category?.type || 'N/A'}</td>
                                </>
                              )}
                              <td>
                                <span className={`badge ${item.is_active ? 'bg-success' : 'bg-danger'}`}>
                                  {item.is_active ? 'Yes' : 'No'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <Alert variant="info">
                        No {activeTable === "vendors" ? "vendors" : "customers"} found for the selected filter.
                      </Alert>
                    )}
                  </>
                )}
              </>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default StaffDashBoard;