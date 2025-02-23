<template>
    <div class="about-container">
      <h1>About Us</h1>
      <p>
        ขอบคุณที่เสียสละเวลาเข้ามาอ่านข้อความนี้ครับ
      </p>
      <p>
        ผลงานเว็บชิ้นนี้สร้างขึ้นเพื่อแสดงศักยภาพในการเขียนเว็บขึ้นมา เพื่อเป็นข้อพิสูจน์ว่าผู้สร้างมีความสามารถมากพอ ที่จะสร้างเว็บๆนึงขึ้นมาได้
      </p>
      <p>
        โดยเว็บไซต์นี้เป็นประสบการณ์การใช้ framework และ database ที่ผมไม่เคยใช้มาก่อน โดยผมใช้ vue และ postgresql ในการสร้างขึ้นมา โดยไม่มีความรู้ใดๆเกี่ยวกับโปรแกรมที่ว่ามาเลย
      </p>
      <p>
        ผมอยากใช้ผลงี้นี้เป็นเวทีแสดงให้เห็นว่าผมพร้อมที่จะทำบางอย่างและพร้อมที่จะเรียนรู้สิ่งใหม่
      </p>
      <p>
        ทั้งนี้ก็ขอขอบคุณที่กรุณาเข้ามาอ่านอีกครั้งครับผม
      </p>

      <h6>
        ช่องทางการติดต่อ 
      </h6>
      <p>GitHub : https://github.com/Tufu-Ma</p>
      <p>Email : surachai.ma@ku.th</p>
      <p>Phone : 0972573835 </p>
      <router-link to="/" class="back-btn">Back to Home</router-link>
    </div>
  </template>
  
  <style scoped>
  .about-container {
    max-width: 600px;
    margin: 50px auto;
    text-align: center;
  }
  
  h1 {
    color: #2c3e50;
  }
  
  p {
    font-size: 16px;
    color: #555;
    margin-bottom: 15px;
  }
  
  .back-btn {
    display: inline-block;
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 5px;
  }
  
  .back-btn:hover {
    background-color: #2980b9;
  }
  </style>
  