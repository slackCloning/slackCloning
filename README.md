# :pushpin: slackClone
>슬랙이라는 서비스를 참고해서, 실시간으로 게시물을 올리고, 다른 사용자와 채팅을 할 수 있는 서비스.
>http://ㅁㅁㅁ

</br>

## 1. 제작 기간 & 참여 인원
- 2021년 7월 16일 ~ 7월 22일
- Backend 
  - 이대성
  - 오인웅
- Frontend
  - 원동환
  - 허동우

</br>

## 2. 사용 기술
#### `Back-end`
  - Node.js 14.15.4
  - Express 4.17.1
  - Socket.io 2.4.1
  - Mysql 8.0.1
  - Sequelize 6.6.4
 
#### `Front-end`
  - React.js 17.0.2

</br>

## 3. ERD 설계
![](https://user-images.githubusercontent.com/47413926/126596387-96bfa74d-0559-4927-8201-d799215e33fc.png)


## 4. 핵심 기능
이 서비스의 핵심 기능은 실시간으로 게시글 등록 기능입니다.  
사용자 아무나 채널을 만들 수 있고, 채널을 만들 때 다른 사용자들을 지정하면 만듭니다. 
채널에 있는 사람들은 게시글을 올리면 실시간으로 채널에 있는 다른 사용자들이 볼 수 있습니다.

<details>
<summary><b>핵심 기능 설명 펼치기</b></summary>
<div markdown="1">

### 4.1. 전체 흐름
![](https://zuminternet.github.io/images/portal/post/2019-04-22-ZUM-Pilot-integer/flow1.png)

### 4.2. 사용자 요청
![](https://zuminternet.github.io/images/portal/post/2019-04-22-ZUM-Pilot-integer/flow_vue.png)

- **URL 정규식 체크** :pushpin: [코드 확인](https://github.com/Integerous/goQuality/blob/b587bbff4dce02e3bec4f4787151a9b6fa326319/frontend/src/components/PostInput.vue#L67)
  - Vue.js로 렌더링된 화면단에서, 사용자가 등록을 시도한 URL의 모양새를 정규식으로 확인합니다.
  - URL의 모양새가 아닌 경우, 에러 메세지를 띄웁니다.

- **Axios 비동기 요청** :pushpin: [코드 확인]()
  - URL의 모양새인 경우, 컨텐츠를 등록하는 POST 요청을 비동기로 날립니다.

### 4.3. Controller

![](https://zuminternet.github.io/images/portal/post/2019-04-22-ZUM-Pilot-integer/flow_controller.png)

- **요청 처리** :pushpin: [코드 확인](https://github.com/Integerous/goQuality/blob/b2c5e60761b6308f14eebe98ccdb1949de6c4b99/src/main/java/goQuality/integerous/controller/PostRestController.java#L55)
  - Controller에서는 요청을 화면단에서 넘어온 요청을 받고, Service 계층에 로직 처리를 위임합니다.

- **결과 응답** :pushpin: [코드 확인]()
  - Service 계층에서 넘어온 로직 처리 결과(메세지)를 화면단에 응답해줍니다.

### 4.4. Service

![](https://zuminternet.github.io/images/portal/post/2019-04-22-ZUM-Pilot-integer/flow_service1.png)

- **Http 프로토콜 추가 및 trim()** :pushpin: [코드 확인]()
  - 사용자가 URL 입력 시 Http 프로토콜을 생략하거나 공백을 넣은 경우,  
  올바른 URL이 될 수 있도록 Http 프로토콜을 추가해주고, 공백을 제거해줍니다.

- **URL 접속 확인** :pushpin: [코드 확인]()
  - 화면단에서 모양새만 확인한 URL이 실제 리소스로 연결되는지 HttpUrlConnection으로 테스트합니다.
  - 이 때, 빠른 응답을 위해 Request Method를 GET이 아닌 HEAD를 사용했습니다.
  - (HEAD 메소드는 GET 메소드의 응답 결과의 Body는 가져오지 않고, Header만 확인하기 때문에 GET 메소드에 비해 응답속도가 빠릅니다.)

  ![](https://zuminternet.github.io/images/portal/post/2019-04-22-ZUM-Pilot-integer/flow_service2.png)

- **Jsoup 이미지, 제목 파싱** :pushpin: [코드 확인]()
  - URL 접속 확인결과 유효하면 Jsoup을 사용해서 입력된 URL의 이미지와 제목을 파싱합니다.
  - 이미지는 Open Graphic Tag를 우선적으로 파싱하고, 없을 경우 첫 번째 이미지와 제목을 파싱합니다.
  - 컨텐츠에 이미지가 없을 경우, 미리 설정해둔 기본 이미지를 사용하고, 제목이 없을 경우 생략합니다.


### 4.5. Repository

![](https://zuminternet.github.io/images/portal/post/2019-04-22-ZUM-Pilot-integer/flow_repo.png)

- **컨텐츠 저장** :pushpin: [코드 확인]()
  - URL 유효성 체크와 이미지, 제목 파싱이 끝난 컨텐츠는 DB에 저장합니다.
  - 저장된 컨텐츠는 다시 Repository - Service - Controller를 거쳐 화면단에 송출됩니다.

</div>
</details>

</br>

## 5. 핵심 트러블 슈팅
### 5.1. DirectMessage를 주고 받는 사용자 구분 문제
- Dm(Direct Message)라는 테이블에는 현재 로그인 유저정보(userId) 와 상대방 유저정보(otherUserId)가 필요합니다. 
- 처음에 DB 설계를 할 때, 큰 고민 없이 테이블 내에서 자동적으로 증가하는 id 값을 primary key로 설정하였습니다.
- 이렇게 설계를 하고나니, 문제가 되는 것이 테이블에 있는 데이터의 userId가 로그인 한 사람인지, 아닌지를 구별을 하지 못했습니다.
- 그래서 Dm에 데이터를 넣는 한번의 요청에서, userId, otherUserId로 한번 넣고, 순서를 바꿔 oterUserId, userId로 Insert 하였습니다. 
- 그런데 이렇게 한번의 요청에 데이터를 두 번 집어 넣으니, primary key가 두 개가 생겨 버립니다. 
- 키가 두  개가 생기기 때문에, 원하는 값을 조회 하거나 수정할 수 없는 문제가 발생하였습니다. 
- group을 지울 수 있는 새로운 primary key인 dmsId를 만들어서 이러한 문제를 해결하였습니다.


### 5.2. 채널을 만들고 나서, 해당 채널에 속한 사용자들한테만 채널을 보여 줘야하는 어려움
- 누군가가 채널을 만들 때, 채널에 추가 될 사용자들을 선택합니다.
- 채널을 만들고 나면, socket을 이용하여 실시간으로 채널에 속한 사용자들한테 만들어진 채널이 보여 줘야 합니다.
- 이 , 해당 채널에 속한 사용자들한테만 채널을 보여줘야 하는데 이 부분에서 어려움이 있었습니다.
- 프론트 개발자와 의논을 한 뒤, 우리 팀이 선택한 방법은 다음과 같습니다.
  - 서버 side에서 채널 생성 요청이 들어 올 때, socket 통신으로 클라이언트에게 알려 줍니다.
  - 클라이언트 side에서 socket을 통해 들어 온 신호를 받아, 현재 로그인한 사람의 채널 정보를 받아오는 요청을 다시 합니다.

</br>

## 6. 그 외 트러블 슈팅
<details>
<summary>관계 맺은 테이블 간 alias 설정 문제</summary>
<div markdown="1">

- 에러: User is associated to Dm using an alias. You've include an alias (OtherUser), but it does not match the alias(es) defined in your association(User).
- 해결: Sequelize 에서 관계 맺은 테이블의 alias를 사용하기 위해서는 테이블끼리 관계를 맺을 때 사용한 as 속성과 데이터를 가져올 때 사용하는 as 속성의 이름을 똑같이 해야 됨.

</div>
</details>

<details>
<summary>socket 통신 CORS 에러 발생</summary>
<div markdown="1">
  
  - 에러: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
  - 해결: websocket의 모든 transportation을 허용되는 것이 아니기 때문에, 클라이언트에서 소켓이랑 연결할 때, transports를 'websocket'으로 지정 해주어서 문제 해결.
  
</div>
</details>

<details>
<summary>배포 시 mySql 연동할 때 발생하는 오류</summary>
<div markdown="1">
  
  - 에러: Access denied for user 'root'@'localhost' (using password: YES)
  - 해결: root 사용자의 비밀번호를 일치시키도록 update user set authentication_string=password('1234') where user='root'; 쿼리문 실행
  
</div>
</details>

<details>
<summary> 배포 시 Port번호를 찾지 못하는 문제 </summary>
<div markdown="1">
  
  - 문제: 배포하고 난 뒤, 배포한 서버에 접속할 수 없는 문제
  - 해결: sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000 명령어를 통해 문제를 해결.
  
</div>
</details>
    
<details>
<summary> Socket으로 채팅을 하는데, 소켓통신이 제대로 이루어지지 않는 문제  </summary>
<div markdown="1">
  
  ```javascript
    //기존코드
    socket.on('chat', async (data) => {
            const { dmsId, userId, chat } = data;
            const result = await Chat.create({
                dmsId,
                userId,
                chat,
            });
            socket.emit("receive", result);
        });


      //수정코드
      socket.on('chat', async (data) => {
                  const { dmsId, userId, chat } = data;
                  const result = await Chat.create({
                      dmsId,
                      userId,
                      chat,
                  });
                  io.of('chat').emit("receive", result);
              });
  ```
  
  - 해결:  socket.emit("receive", result); => io.of('chat').emit("receive", result); 
   
</div>
</details>    

</br>

## 6. 회고 / 느낀점
>프로젝트 개발 회고 글: https://zuminternet.github.io/ZUM-Pilot-integer/
