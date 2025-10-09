#!/usr/bin/env python3
"""
Backend API Testing for Hackathon Form Submission App
Tests all API endpoints in demo mode with comprehensive validation
"""

import requests
import json
import time
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://project-nexus-22.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

def test_health_endpoint():
    """Test the health check endpoint"""
    print("\n=== Testing Health Endpoint ===")
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['status', 'timestamp', 'mode']
            for field in required_fields:
                if field not in data:
                    print(f"❌ Missing required field: {field}")
                    return False
            
            # Validate values
            if data['status'] != 'ok':
                print(f"❌ Expected status 'ok', got '{data['status']}'")
                return False
                
            if data['mode'] != 'demo':
                print(f"❌ Expected mode 'demo', got '{data['mode']}'")
                return False
                
            # Validate timestamp format
            try:
                datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
            except ValueError:
                print(f"❌ Invalid timestamp format: {data['timestamp']}")
                return False
                
            print("✅ Health endpoint working correctly")
            return True
        else:
            print(f"❌ Health endpoint failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Health endpoint test failed: {str(e)}")
        return False

def test_submit_valid_data():
    """Test form submission with valid data"""
    print("\n=== Testing Form Submission with Valid Data ===")
    
    valid_data = {
        "teamName": "Tech Innovators",
        "teamLeadName": "Alice Johnson",
        "teamLeadEmail": "alice.johnson@example.com",
        "teamLeadContact": "+1-555-0123",
        "projectTitle": "AI Sustainability Tracker",
        "projectDescription": "We're building an AI-powered sustainability tracker that helps organizations monitor and reduce their carbon footprint through intelligent data analysis and actionable insights.",
        "gitLink": "https://github.com/techinnovators/hackathon-project",
        "projectUrl": "https://techinnovators.demo.com",
        "projectLogoUrl": "https://demo-storage.supabase.co/logos/tech-innovators-logo.png",
        "projectBannerUrl": "https://demo-storage.supabase.co/banners/tech-innovators-banner.jpg",
        "videoDemoLink": "https://youtube.com/watch?v=demo123"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/submit",
            json=valid_data,
            headers={'Content-Type': 'application/json'},
            timeout=15
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            if not data.get('success'):
                print(f"❌ Expected success=true, got {data.get('success')}")
                return False
                
            if 'message' not in data:
                print("❌ Missing 'message' field in response")
                return False
                
            if 'data' not in data:
                print("❌ Missing 'data' field in response")
                return False
                
            # Validate returned data contains submitted fields
            returned_data = data['data']
            for key, value in valid_data.items():
                if returned_data.get(key) != value:
                    print(f"❌ Mismatch in {key}: expected '{value}', got '{returned_data.get(key)}'")
                    return False
            
            # Check for demo ID format
            if not returned_data.get('id', '').startswith('demo_'):
                print(f"❌ Expected demo ID format, got: {returned_data.get('id')}")
                return False
                
            print("✅ Form submission with valid data working correctly")
            return True
        else:
            print(f"❌ Form submission failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Form submission test failed: {str(e)}")
        return False

def test_submit_missing_required_fields():
    """Test form submission with missing required fields"""
    print("\n=== Testing Form Submission with Missing Required Fields ===")
    
    # Test cases with missing required fields
    test_cases = [
        {
            "name": "Missing teamName",
            "data": {
                "teamLeadName": "Bob Smith",
                "teamLeadEmail": "bob@example.com",
                "teamLeadContact": "+1-555-0456",
                "projectTitle": "Test Project",
                "projectDescription": "A test project description"
            }
        },
        {
            "name": "Missing teamLeadName", 
            "data": {
                "teamName": "Code Warriors",
                "teamLeadEmail": "team@example.com",
                "teamLeadContact": "+1-555-0789",
                "projectTitle": "Test Project",
                "projectDescription": "A test project description"
            }
        },
        {
            "name": "Missing teamLeadEmail",
            "data": {
                "teamName": "Data Wizards",
                "teamLeadName": "Carol Davis",
                "teamLeadContact": "+1-555-0321",
                "projectTitle": "Test Project",
                "projectDescription": "A test project description"
            }
        },
        {
            "name": "Missing teamLeadContact",
            "data": {
                "teamName": "AI Pioneers",
                "teamLeadName": "David Wilson",
                "teamLeadEmail": "david@example.com",
                "projectTitle": "Test Project",
                "projectDescription": "A test project description"
            }
        },
        {
            "name": "Missing projectTitle",
            "data": {
                "teamName": "Innovation Squad",
                "teamLeadName": "Emma Brown",
                "teamLeadEmail": "emma@example.com",
                "teamLeadContact": "+1-555-0654",
                "projectDescription": "A test project description"
            }
        },
        {
            "name": "Missing projectDescription",
            "data": {
                "teamName": "Future Builders",
                "teamLeadName": "Frank Miller",
                "teamLeadEmail": "frank@example.com",
                "teamLeadContact": "+1-555-0987",
                "projectTitle": "Test Project"
            }
        },
        {
            "name": "Empty payload",
            "data": {}
        }
    ]
    
    all_passed = True
    
    for test_case in test_cases:
        print(f"\nTesting: {test_case['name']}")
        try:
            response = requests.post(
                f"{API_BASE}/submit",
                json=test_case['data'],
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 400:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2)}")
                
                if 'error' in data and 'Missing required fields' in data['error']:
                    print(f"✅ {test_case['name']} - Correctly rejected")
                else:
                    print(f"❌ {test_case['name']} - Wrong error message")
                    all_passed = False
            else:
                print(f"❌ {test_case['name']} - Expected 400, got {response.status_code}")
                print(f"Response: {response.text}")
                all_passed = False
                
        except Exception as e:
            print(f"❌ {test_case['name']} test failed: {str(e)}")
            all_passed = False
    
    if all_passed:
        print("\n✅ All missing required fields tests passed")
    else:
        print("\n❌ Some missing required fields tests failed")
    
    return all_passed

def test_get_submissions():
    """Test retrieving all submissions"""
    print("\n=== Testing Get Submissions Endpoint ===")
    
    try:
        response = requests.get(f"{API_BASE}/submissions", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Should return an array
            if not isinstance(data, list):
                print(f"❌ Expected array response, got {type(data)}")
                return False
            
            print(f"✅ Retrieved {len(data)} submissions successfully")
            
            # If there are submissions, validate structure
            if len(data) > 0:
                submission = data[0]
                required_fields = ['id', 'teamName', 'teamLeadName', 'email', 'contact', 'createdAt']
                for field in required_fields:
                    if field not in submission:
                        print(f"❌ Missing field '{field}' in submission")
                        return False
                print("✅ Submission structure is valid")
            
            return True
        else:
            print(f"❌ Get submissions failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Get submissions test failed: {str(e)}")
        return False

def test_invalid_endpoints():
    """Test invalid endpoints return 404"""
    print("\n=== Testing Invalid Endpoints ===")
    
    invalid_endpoints = [
        f"{API_BASE}/invalid",
        f"{API_BASE}/nonexistent",
        f"{API_BASE}/test"
    ]
    
    all_passed = True
    
    for endpoint in invalid_endpoints:
        try:
            response = requests.get(endpoint, timeout=10)
            print(f"GET {endpoint}: Status {response.status_code}")
            
            if response.status_code == 404:
                data = response.json()
                if 'error' in data and 'not found' in data['error'].lower():
                    print(f"✅ Correctly returned 404 for {endpoint}")
                else:
                    print(f"❌ Wrong error message for {endpoint}")
                    all_passed = False
            else:
                print(f"❌ Expected 404, got {response.status_code} for {endpoint}")
                all_passed = False
                
        except Exception as e:
            print(f"❌ Test failed for {endpoint}: {str(e)}")
            all_passed = False
    
    return all_passed

def run_comprehensive_test():
    """Run all tests and provide summary"""
    print("🚀 Starting Comprehensive Backend API Testing")
    print(f"Testing against: {API_BASE}")
    print("=" * 60)
    
    test_results = []
    
    # Run all tests
    test_results.append(("Health Endpoint", test_health_endpoint()))
    test_results.append(("Submit Valid Data", test_submit_valid_data()))
    test_results.append(("Submit Missing Fields", test_submit_missing_required_fields()))
    test_results.append(("Get Submissions", test_get_submissions()))
    test_results.append(("Invalid Endpoints", test_invalid_endpoints()))
    
    # Summary
    print("\n" + "=" * 60)
    print("🏁 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1
    
    print(f"\nOverall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend API is working correctly in demo mode.")
        return True
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    success = run_comprehensive_test()
    exit(0 if success else 1)