angular.module('myApp', [
    'ngRoute',
    'mobile-angular-ui',
	'btford.socket-io'
]).config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'home.html',
        controller: 'Home'
    });
}).factory('mySocket', function (socketFactory) {
	var myIoSocket = io.connect('/webapp');	//Tên namespace webapp

	mySocket = socketFactory({
		ioSocket: myIoSocket
	});
	return mySocket;
	
/////////////////////// Những dòng code ở trên phần này là phần cài đặt, các bạn hãy đọc thêm về angularjs để hiểu, cái này không nhảy cóc được nha!
}).controller('Home', function($scope, mySocket) {
	////Khu 1 -- Khu cài đặt tham số 
    //cài đặt một số tham số test chơi
	//dùng để đặt các giá trị mặc định
    $scope.CamBienMua = "Không biết nữa ahihi, chưa thấy có thằng nào cập nhập hết";
    $scope.leds_status = [1, 1]
	$scope.lcd = ["", ""]
	$scope.servoPosition = 0
	$scope.buttons = [] //chả có gì cả, arduino gửi nhiêu thì nhận nhiêu!
	
	////Khu 2 -- Cài đặt các sự kiện khi tương tác với người dùng
	//các sự kiện ng-click, nhấn nút
	$scope.updateSensor  = function() {
		mySocket.emit("RAIN")
	}
	
	
	//Cách gửi tham số 1: dùng biến toàn cục! $scope.<tên biến> là biến toàn cục
	$scope.changeLED = function() {
		console.log("send LED ", $scope.leds_status)
		
		var json = {
			"led": $scope.leds_status
		}
		mySocket.emit("LED", json)
	}
	
	//cập nhập lcd như một ông trùm 
	$scope.updateLCD = function() {
		
		
		var json = {
			"line": $scope.lcd
		}
		console.log("LCD_PRINT ", $scope.lcd)
		mySocket.emit("LCD_PRINT", json)
	}
	
	//Cách gửi tham số 2: dùng biến cục bộ: servoPosition. Biến này đươc truyền từ file home.html, dữ liệu đươc truyền vào đó chính là biến toàn cục $scope.servoPosition. Cách 2 này sẽ giúp bạn tái sử dụng hàm này vào mục đích khác, thay vì chỉ sử dụng cho việc bắt sự kiện như cách 1, xem ở Khu 4 để biết thêm ứng dụng!
	$scope.updateServo = function(servoPosition) {
		
		var json = {
			"degree": servoPosition,
			"message": "Goc ne: " + servoPosition
		}
		
		console.log("SEND SERVO", json) //debug chơi à
		mySocket.emit("SERVO", json)
	}
	
	////Khu 3 -- Nhận dữ liệu từ Arduno gửi lên (thông qua ESP8266 rồi socket server truyền tải!)
	//các sự kiện từ Arduino gửi lên (thông qua esp8266, thông qua server)
	mySocket.on('RAIN', function(json) {
		$scope.CamBienMua = (json.digital == 1) ? "Không mưa" : "Có mưa rồi yeah ahihi"
	})
	//Khi nhận được lệnh LED_STATUS
	mySocket.on('LED_STATUS', function(json) {
		//Nhận được thì in ra thôi hihi.
		console.log("recv LED", json)
		$scope.leds_status = json.data
	})
	//khi nhận được lệnh Button
	mySocket.on('BUTTON', function(json) {
		//Nhận được thì in ra thôi hihi.
		console.log("recv BUTTON", json)
		$scope.buttons = json.data
	})
	
	
	//// Khu 4 -- Những dòng code sẽ được thực thi khi kết nối với Arduino (thông qua socket server)
	mySocket.on('connect', function() {
		console.log("connected")
		mySocket.emit("RAIN") //Cập nhập trạng thái mưa
		
		$scope.updateServo(0) //Servo quay về góc 0 độ!. Dùng cách 2 
	})
		
});