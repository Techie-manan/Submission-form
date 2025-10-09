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
                required_fields = ['id', 'teamName', 'teamLeadName', 'teamLeadEmail', 'teamLeadContact', 'projectTitle', 'projectDescription', 'createdAt']
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

def test_project_description_word_count():
    """Test project description word count validation (max 100 words)"""
    print("\n=== Testing Project Description Word Count Validation ===")
    
    # Test with exactly 100 words (should pass)
    words_100 = " ".join([f"word{i}" for i in range(100)])
    valid_data_100_words = {
        "teamName": "Word Count Team",
        "teamLeadName": "Test Leader",
        "teamLeadEmail": "test@example.com",
        "teamLeadContact": "+1-555-1234",
        "projectTitle": "Word Count Test",
        "projectDescription": words_100
    }
    
    # Test with 101 words (should fail)
    words_101 = " ".join([f"word{i}" for i in range(101)])
    invalid_data_101_words = {
        "teamName": "Word Count Team",
        "teamLeadName": "Test Leader",
        "teamLeadEmail": "test@example.com",
        "teamLeadContact": "+1-555-1234",
        "projectTitle": "Word Count Test",
        "projectDescription": words_101
    }
    
    all_passed = True
    
    # Test 100 words (should pass)
    print("\nTesting with exactly 100 words (should pass):")
    try:
        response = requests.post(
            f"{API_BASE}/submit",
            json=valid_data_100_words,
            headers={'Content-Type': 'application/json'},
            timeout=15
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ 100 words accepted correctly")
            else:
                print("❌ 100 words rejected incorrectly")
                all_passed = False
        else:
            print(f"❌ 100 words test failed with status {response.status_code}")
            print(f"Response: {response.text}")
            all_passed = False
            
    except Exception as e:
        print(f"❌ 100 words test failed: {str(e)}")
        all_passed = False
    
    # Test 101 words (should fail)
    print("\nTesting with 101 words (should fail):")
    try:
        response = requests.post(
            f"{API_BASE}/submit",
            json=invalid_data_101_words,
            headers={'Content-Type': 'application/json'},
            timeout=15
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            if 'error' in data and 'Project description must be 100 words or less' in data['error'] and 'Current: 101 words' in data['error']:
                print("✅ 101 words correctly rejected with proper error message")
            else:
                print(f"❌ Wrong error message for 101 words: {data.get('error')}")
                all_passed = False
        else:
            print(f"❌ Expected 400 for 101 words, got {response.status_code}")
            print(f"Response: {response.text}")
            all_passed = False
            
    except Exception as e:
        print(f"❌ 101 words test failed: {str(e)}")
        all_passed = False
    
    return all_passed

def test_file_upload_endpoint():
    """Test file upload endpoint with validation"""
    print("\n=== Testing File Upload Endpoint ===")
    
    all_passed = True
    
    # Test 1: No file provided
    print("\nTesting upload with no file (should fail):")
    try:
        response = requests.post(f"{API_BASE}/upload", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            if 'error' in data and 'No file provided' in data['error']:
                print("✅ No file correctly rejected")
            else:
                print(f"❌ Wrong error message for no file: {data.get('error')}")
                all_passed = False
        else:
            print(f"❌ Expected 400 for no file, got {response.status_code}")
            all_passed = False
            
    except Exception as e:
        print(f"❌ No file test failed: {str(e)}")
        all_passed = False
    
    # Test 2: Valid image file (simulated)
    print("\nTesting upload with valid image file (simulated):")
    try:
        # Create a small test image data
        import io
        test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = {'file': ('test.png', io.BytesIO(test_image_data), 'image/png')}
        data = {'folder': 'test-uploads'}
        
        response = requests.post(f"{API_BASE}/upload", files=files, data=data, timeout=15)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            if response_data.get('success') and 'url' in response_data and 'message' in response_data:
                print("✅ Valid image upload working correctly")
                print(f"Upload URL: {response_data['url']}")
            else:
                print(f"❌ Invalid response structure: {response_data}")
                all_passed = False
        else:
            print(f"❌ Valid image upload failed with status {response.status_code}")
            print(f"Response: {response.text}")
            all_passed = False
            
    except Exception as e:
        print(f"❌ Valid image upload test failed: {str(e)}")
        all_passed = False
    
    # Test 3: Invalid file type (simulated)
    print("\nTesting upload with invalid file type (simulated):")
    try:
        files = {'file': ('test.txt', io.BytesIO(b'This is a text file'), 'text/plain')}
        
        response = requests.post(f"{API_BASE}/upload", files=files, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            if 'error' in data and 'Only image files are allowed' in data['error']:
                print("✅ Invalid file type correctly rejected")
            else:
                print(f"❌ Wrong error message for invalid file type: {data.get('error')}")
                all_passed = False
        else:
            print(f"❌ Expected 400 for invalid file type, got {response.status_code}")
            print(f"Response: {response.text}")
            all_passed = False
            
    except Exception as e:
        print(f"❌ Invalid file type test failed: {str(e)}")
        all_passed = False
    
    return all_passed

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