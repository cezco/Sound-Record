<html>
<head>
    <title>MP3 Encoder</title>
    <link rel="stylesheet" type="text/css" href="css/css.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.0/lame.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
	<script type="text/javascript" src="js/js.js"></script>
</head>

<body>
<style type="text/css">
.audio-tool-wrapper {
  display: flex;
  justify-content: center;
}

.audio-tool-wrapper > span {
  width: 100px;
  margin: 8px;
  text-align: center;
  position:relative;
  display:block;
}
</style>

<h1>MP3 Recorder</h1>
	<div class="audio-recorder" data-question-id="12" data-audio-index="1">
    	<div class="audio-tool-wrapper">
        	<span><a class="audio-tool tool-record"><span></span></a></span>
        	<span><a class="audio-tool tool-play"><span></span></a></span>
        	<span><a class="audio-tool tool-stop"><span></span></a></span>
        	<span><a class="audio-tool tool-upload"><span></span></a></span>
        	<span><a class="audio-tool tool-download"><span></span></a></span>
        	<span><a class="audio-tool tool-delete"><span></span></a></span>
            <span><span class="tool-timer"><i></i></span></span>
        </div>
    </div>
	<div class="audio-recorder" data-question-id="12" data-audio-index="2">
    	<div class="audio-tool-wrapper">
        	<span><a class="audio-tool tool-record"><span></span></a></span>
        	<span><a class="audio-tool tool-play"><span></span></a></span>
        	<span><a class="audio-tool tool-stop"><span></span></a></span>
        	<span><a class="audio-tool tool-upload"><span></span></a></span>
        	<span><a class="audio-tool tool-download"><span></span></a></span>
        	<span><a class="audio-tool tool-delete"><span></span></a></span>
            <span><span class="tool-timer"><i></i></span></span>
        </div>
    </div>
<script type="text/javascript">

var audioRecorder = {
	initialized:false,
	recorder:[]
};


$(document).ready(function(e) {
	
	$(document).on('click', '.audio-recorder .tool-record', function(e)
	{		
		var audioController = $(this).closest('.audio-recorder');
		var idx = audioController.attr("data-index") || "";
		if(idx == "")
		{
			var index = audioRecorder.recorder.length;
			audioRecorder.recorder.push(new MP3Recorder(audioController, index, {
				bitrate:32,
				sampleRate:44100,
				timeLimit:1800,
				uploadSound:function(blob, duration, questionID, audioIndex){
					audioRecorder.recorder[index].beforeUpload();
					setTimeout(function(){
						audioRecorder.recorder[index].afterUpload();
					}, 2000);


					var reader = new FileReader();
					reader.onloadend = function() 
					{
						var url = reader.result;
						$.ajax({
							url:'upload-sound.php',
							type:'POST',
							dataType:"json",
							data:{
								sound_data:url,
								question_id:questionID,
								audio_index:audioIndex
							},
							success: function(data)
							{
								console.log('Uploaded');
							}
						});     
					}
					reader.readAsDataURL(blob); 

				},
				downloadSound:function(blob, duration, questionID, audioIndex)
				{
					//Create a URL to the blob.
					var url = window.URL.createObjectURL(blob);
					window.open(url);

				},
				nullAudio:function()
				{
					alert('Belum ada audio cuy! Selesaikan rekaman dulu...');
				},
				stillRecording:function()
				{
					alert('Masih merekam cuyy! Selesaikan dulu yach...');
				},
				stillPlaying:function()
				{
					alert('Masih memutar cuyy! Ga boleh merekam dulu... Pause dulu kek, atau tunggu selesai...');
				},
				overLimit:function()
				{
					alert('Melebihi batas');
				},
				log:function(text)
				{
					console.log(text);
				}
			}));
		}
	})	
});

</script>
</body>
</html>
