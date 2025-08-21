// Debug function to check what's in localStorage
export function debugCheckStorage() {
  console.log('🔍 DEBUG: Checking localStorage...');
  
  const documents = localStorage.getItem('zeyn-documents');
  const chapters = localStorage.getItem('zeyn-chapters');
  const projects = localStorage.getItem('zeyn-projects');
  
  if (documents) {
    const parsedDocs = JSON.parse(documents);
    console.log('📄 Documents in storage:', parsedDocs.length);
    
    if (parsedDocs.length > 0) {
      console.log('First document:', parsedDocs[0]);
      console.log('First document content:', parsedDocs[0].content);
      
      // Check if content is null, undefined, or empty
      if (!parsedDocs[0].content) {
        console.error('❌ First document has NO content!');
      } else if (parsedDocs[0].content.content && parsedDocs[0].content.content.length === 0) {
        console.error('❌ First document has EMPTY content array!');
      } else {
        console.log('✅ First document has content');
      }
    }
  } else {
    console.log('No documents in storage');
  }
  
  return {
    documents: documents ? JSON.parse(documents) : [],
    chapters: chapters ? JSON.parse(chapters) : [],
    projects: projects ? JSON.parse(projects) : []
  };
}

// Add to window for manual debugging
if (typeof window !== 'undefined') {
  (window as any).debugCheckStorage = debugCheckStorage;
}