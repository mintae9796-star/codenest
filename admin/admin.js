// Firebase 초기화
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// DOM
const loginSection = document.getElementById("loginSection");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const emailInput = document.getElementById("email");
const pwInput = document.getElementById("password");
const postTitle = document.getElementById("postTitle");
const postList = document.getElementById("postList");

// 로그인
loginBtn.addEventListener("click", async () => {
  try {
    await auth.signInWithEmailAndPassword(emailInput.value, pwInput.value);
  } catch (err) {
    document.getElementById("loginError").innerText = err.message;
  }
});

// 로그아웃
logoutBtn.addEventListener("click", () => auth.signOut());

// 로그인 상태 감지
auth.onAuthStateChanged(user => {
  if (user) {
    loginSection.style.display = "none";
    dashboard.style.display = "block";
    loadPosts();
  } else {
    loginSection.style.display = "block";
    dashboard.style.display = "none";
  }
});

// 게시글 불러오기
function loadPosts(){
  db.collection("posts").onSnapshot(snapshot => {
    postList.innerHTML = "";
    snapshot.forEach(doc => {
      const li = document.createElement("li");
      li.textContent = doc.data().title;
      li.innerHTML += ` <button onclick="deletePost('${doc.id}')">삭제</button>`;
      postList.appendChild(li);
    });
  });
}

// 게시글 추가
document.getElementById("addPostBtn").addEventListener("click", async () => {
  if(postTitle.value.trim()){
    await db.collection("posts").add({ title: postTitle.value, createdAt: new Date() });
    postTitle.value = "";
  }
});

// 게시글 삭제
async function deletePost(id){
  await db.collection("posts").doc(id).delete();
}
