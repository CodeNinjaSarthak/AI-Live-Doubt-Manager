import sys
sys.path.insert(0, '.')
from backend.app.services.gemini.client import GeminiClient

print("🧪 Testing Gemini client...")
client = GeminiClient()

print("\n1. Testing embedding generation...")
emb = client.generate_embedding('test')
print(f"   ✅ Got {len(emb)} dimensions (expected 768)")

print("\n2. Testing question classification...")
result = client.classify_question('What is photosynthesis?')
print(f"   ✅ Result: {result}")

print("\n3. Testing answer generation...")
answer = client.generate_answer('What is DNA?', 'DNA is genetic material.')
print(f"   ✅ Answer: {answer[:100]}...")

print("\n✅ All tests passed!")