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
![](https://user-images.githubusercontent.com/47413926/126625060-79797bb5-ecfa-4a84-bf6c-57e25437bb4a.jpg)


  
### 4.2. 사용자 요청
- **로그인** :pushpin: [코드 확인](https://github.com/slackCloning/slackCloning/blob/main/routes/users.js#L40)
  - passport 모듈을 이용해서 로그인 기능을 구현합니다.
  - 로그인을 성공할 시, 클라이언트에게 jwt 토큰을 전달합니다

- **회원가입** :pushpin: [코드 확인](https://github.com/slackCloning/slackCloning/blob/main/routes/users.js#L20)
  - 회원가입에 들어오는 데이터를 validate라는 middleware로 유효성 검사를 합니다.
  - 유효성 검사를 통과하면 비밀번호를 암호화한 후 DB에 저장합니다.
  
- **채널생성** :pushpin: [코드 확인](https://github.com/slackCloning/slackCloning/blob/main/routes/channel.js#L138)
  - 클라이언트로부터 채널이름, 사용자리스트를 전달 받아, Channel 과 ChannelUserList에 데이터를 insert합니다.
  - 채널등록에 성공한 후, 생성한 데이터를 소켓통신으로 클라이언트에 보냅니다.
  
- **Direct Message 보내기** :pushpin: [코드 확인](https://github.com/slackCloning/slackCloning/blob/main/routes/chat.js#L50)
  - 먼저, 이전에 DM을 보낸 적이 있는 지 체크를 합니다.
  - 만약, 보낸 적이 없다면 DM테이블에 사용자들을 추가합니다.
  
- **게시글 작성하기** :pushpin: [코드 확인](https://github.com/slackCloning/slackCloning/blob/main/routes/channel.js#L199)
  - 필요한 데이터를 클라이언트로부터 전달 받습니다. 특별히 어떤 채널에 종속되어지는 데이터이기 때문에 채널 아이디를 전달 받아야 합니다.

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

- 프로젝트 설계단계의 중요성
  - API 설계의 중요 - 클라이언트와 협업을 하면서 API 명칭을 정하는 것부터, 서로 주고 받는 데이터의 형태까지 정확하게 정의해야함을 다시 한번 더 뼈저리게 느꼈습니다.
  - 설계단계에서 DB 설계를 완벽히 했다고 생각을 하였는데, 프로젝트 진행 중 얼마나 많이 DB 수정을 하였는 지 모릅니다. 설계단계에서 겸손한 자세로, 좀 더 꼼꼼하게 준비를 해야겠다는 생각을 하였습니다.
  
- 협업의 어려움
  - 함께 일을 한다는 것이 이렇게 어려운 것인 줄 몰랐습니다. 분명, 함께 모여서 같은 이슈에 대해 같은 이야기를 하고 있는 것 같았는데, 시간이 지난 뒤 그것에 대해 서로 생각하는 것이 전혀 달랐던 적이 한 두번이 아니었습니다. 프로젝트 기간동안 가장 많이 고민했던 부분이 어떻게 하면 좋은 의사소통을 하는 가 였습니다.
  - 프로젝트를 진행하는 중에 '행복한 프로그래밍'이라는 책을 읽었는데, 책에서는 '정확한 근거가 있을 때, 당당하고 솔직한 태도를 취하는 것이 프로그래머에게 있어서 의사소통 기술의 핵심이다'라고 하였습니다. 정확한 근거를 갖기 위해서, 더 많이 공부하고, 정진 해야겠다는 생각을 하였습니다.

- 장인 정신
  - 짧은 개발기간 이었지만, 많은 것을 얻을 수 있었습니다. 개발을 하면서, 단순히 코드만 입력하는 것이 아니라 충분히 생각할려고 노력하였습니다. 프로그래머는 계속해서 생각하고, 고민하고, 고려해서 프로그램을 만들 때, 그 프로그램에 대한 책임감, 애착, 열정이 생긴다고 합니다. 이번 프로젝트는 제가 이러한 '장인정신을 가진 프로그래머가 되자'라는 생각을 갖게 해준 좋은 프로젝트이었습니다.

  
    
