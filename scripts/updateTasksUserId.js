const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function updateTasksUserId() {
  const tasksRef = db.collection('tasks');
  const snapshot = await tasksRef.get();

  if (snapshot.empty) {
    console.log('No tasks found.');
    return;
  }

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.userId) {
      // Here you need to decide how to assign userId.
      // For example, if you have a way to determine the userId for each task, update accordingly.
      // For demo, we set a placeholder userId.
      const userId = 'PLACEHOLDER_USER_ID'; // Replace with actual userId logic

      await doc.ref.update({ userId });
      console.log(`Updated task ${doc.id} with userId ${userId}`);
    }
  }
  console.log('Finished updating tasks.');
}

updateTasksUserId().catch(console.error);
