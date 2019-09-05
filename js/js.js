function MP3Recorder(audioController, index, args)
{
	this.gAudio = new Audio();
	this.gAudioContext = null;//Audio context
	this.gAudioSrc = null;    //Audio source
	this.gNode = null;        //The audio processor node
	this.gIsLame = false;     //Has lame.min.js been loaded?
	this.gLame = null;        //The LAME encoder library
	this.gEncoder = null;     //The MP3 encoder object
	this.gStrmMp3 = [];       //Collection of MP3 buffers
	this.gIsRecording = false;//Indicate that recording process is running
	this.gCfg = {             //Encoder configuration
		chnlCt:         1,    //1=mono, 2=stereo
		bufSz:          4096, //input buffer size (bytes), 16bit signed int.
		sampleRate:     22050,//Input sample rate (samples per second)
		bitRate:        32    //Output bit rate (9-128)
	};
	this.gBlob = null;
	this.gOverLimit = false;  //Overlimit
	this.args = {};           //Argument from cunstructor
	this.gPcmCt = 0;          //Total input bytes
	this.gMp3Ct = 0;          //Total output bytes
	this.gPowerOn = false;
	this.gAudioController = audioController;
	this.gIndex = 0;
	this.gInterval = setInterval(function(){}, 1000000);
	this.gDuration = 0;
	this.gStartTime = 0;
	this.gTimeLimit = 1800;
	this.btnRecord = null;
	this.btnnPlay = null;
	this.btnUpload = null;
	this.btnDownload = null;
	this.btnDelete = null;
	this.txtStatus = null;
	
	this.uploadSound = function(blob, duration, questionID, audioIndex)
	{
	};
	this.downloadSound = function(blob, duration, questionID, audioIndex)
	{
	};
	this.stillRecording = function()
	{
	};
	this.stillPlaying = function()
	{
	};
	this.nullAudio = function()
	{
	};
	this.overLimit = function()
	{
	};
	this.log = function()
	{
	};

	this.init = function(audioController, index, args)
	{
		_this.gIndex = index;
		_this.btnRecord = _this.gAudioController.find('.tool-record');
		_this.btnPlay = _this.gAudioController.find('.tool-play');
		_this.btnStop = _this.gAudioController.find('.tool-stop');
		_this.btnUpload = _this.gAudioController.find('.tool-upload');
		_this.btnDownload = _this.gAudioController.find('.tool-download');
		_this.btnDelete = _this.gAudioController.find('.tool-delete');
		_this.txtStatus = _this.gAudioController.find('.tool-timer > i');
		
		if(!audioRecorder.initialized)
		{
			window.AudioContext = window.AudioContext 
				|| window.webkitAudioContext 
				|| AudioContext;
			navigator.getUserMedia = navigator.getUserMedia
				|| navigator.webkitGetUserMedia
				|| navigator.mozGetUserMedia
				|| navigator.msGetUserMedia
				|| MediaDevices.getUserMedia;
			audioRecorder.initialized = true;

		}

		
		args = args || {};
		_this.args = args;
		
		var bitrate = args.bitrate || 32;
		var timeLimit = args.timeLimit || 1800;
		var sampleRate = args.sampleRate || 44100;
		var bufferSize = args.bufferSize || 4096;
		
		_this.gTimeLimit = timeLimit;
		_this.gCfg.bitRate = bitrate;
		_this.gCfg.sampleRate = sampleRate;
		_this.gCfg.bufSz = bufferSize;

		if(typeof args.uploadSound == 'function')
		{
			_this.uploadSound = function(blob, duration, questionID, audioIndex)
			{
				args.uploadSound(blob, duration, questionID, audioIndex);
			}
		}
		if(typeof args.downloadSound == 'function')
		{
			_this.downloadSound = function(blob, duration, questionID, audioIndex)
			{
				args.downloadSound(blob, duration, questionID, audioIndex);
			}
		}
		if(typeof args.stillRecording == 'function')
		{
			_this.stillRecording = function()
			{
				args.stillRecording();
			}
		}
		if(typeof args.stillPlaying == 'function')
		{
			_this.stillPlaying = function()
			{
				args.stillPlaying();
			}
		}
		if(typeof args.overLimit == 'function')
		{
			_this.overLimit = function()
			{
				args.overLimit();
			}
		}
		if(typeof args.nullAudio == 'function')
		{
			_this.nullAudio = function()
			{
				args.nullAudio();
			}
		}
		if(typeof args.log == 'function')
		{
			_this.log = function(text)
			{
				args.log(text);
			}
		}

		_this.gAudioController.attr('data-index', _this.gIndex);
		_this.btnRecord.on('click', function(e){
			if($(this).hasClass('disabled'))
			{
				_this.stillPlaying();
			}
			else
			{
				if(audioRecorder.recorder[_this.gIndex].gIsRecording)
				{
					audioRecorder.recorder[_this.gIndex].onStop();
					audioRecorder.recorder[_this.gIndex].gIsRecording = false;
					$(this).removeClass('recording');
					_this.btnPlay.removeClass('disabled');
					_this.btnUpload.removeClass('disabled');
					_this.btnDownload.removeClass('disabled');
					_this.btnStop.removeClass('disabled');
				}
				else
				{
					if(_this.isRecording())
					{
						_this.stillRecording();
					}
					else
					{
						if(!_this.gPowerOn)
						{
							_this.onPower();
							_this.btnDownload.addClass('disabled');
							_this.btnUpload.addClass('disabled');
							_this.btnPlay.addClass('disabled');
							_this.btnRecord.addClass('recording');
							_this.btnDelete.addClass('disabled');
						}
						else
						{
							if(_this.gOverLimit)
							{
								_this.overLimit();
							}
							else
							{
								audioRecorder.recorder[_this.gIndex].onRecord();
								audioRecorder.recorder[_this.gIndex].gIsRecording = true;
								$(this).addClass('recording');
								_this.btnPlay.addClass('disabled');
							}
						}
					}
				}
			}
			e.preventDefault();
		});
		_this.btnDownload.on('click', function(e){
			if($(this).hasClass('disabled'))
			{
				_this.nullAudio();
			}
			else
			{
				audioRecorder.recorder[_this.gIndex].downloadBlob();
			}
			e.preventDefault();
		});
		_this.btnUpload.on('click', function(e){
			if($(this).hasClass('disabled'))
			{
				_this.nullAudio();
			}
			else
			{
				audioRecorder.recorder[_this.gIndex].uploadBlob();
			}
			e.preventDefault();
		});
		_this.btnStop.on('click', function(e){
			if($(this).hasClass('disabled'))
			{
				_this.nullAudio();
			}
			else
			{
				audioRecorder.recorder[_this.gIndex].stopSound();
			}
			e.preventDefault();
		});
		_this.btnDelete.on('click', function(e){
			if($(this).hasClass('disabled'))
			{
				_this.stillRecording();
			}
			else
			{
				_this.btnDelete.addClass('deleting');
				audioRecorder.recorder[_this.gIndex].deleteSound();
				setTimeout(function(){
					_this.btnDelete.removeClass('deleting');
				}, 200);
			}
			e.preventDefault();
		});
		_this.btnPlay.on('click', function(e){
			if($(this).hasClass('disabled'))
			{
				_this.nullAudio();
			}
			else
			{
				if(_this.gDuration > 0)
				{
					if($(this).hasClass('paused'))
					{
						audioRecorder.recorder[_this.gIndex].pauseSound();
						_this.btnRecord.removeClass('disabled');
						$(this).removeClass('paused');
					}
					else
					{
						audioRecorder.recorder[_this.gIndex].playSound();
						_this.btnRecord.addClass('disabled');
						$(this).addClass('paused');
					}
				}
			}
			e.preventDefault();
		});
		

		
		if(_this.isRecording())
		{
			_this.stillRecording();
		}
		else
		{
			_this.onPower();
			_this.btnDownload.addClass('disabled');
			_this.btnUpload.addClass('disabled');
			_this.btnPlay.addClass('disabled');
			_this.btnRecord.addClass('recording');
			_this.btnDelete.addClass('disabled');
		}
	};
	//Power button
	this.onPower = function(btn) 
	{
		if(!_this.gAudioContext) 
		{
			_this.PowerOn();
		} 
		else 
		{
			_this.PowerOff();
		}
		_this.gPowerOn = true;
	};
	
	this.PowerOn = function() 
	{
		_this.log("Powering up...");
		var caps  = { audio: true };
		try 
		{
			if(!(_this.gAudioContext = new window.AudioContext())) 
			{
				_this.log("ERR: Unable to create AudioContext.");
			} 
			else 
			{
				navigator.getUserMedia(caps, _this.onUserMedia, _this.onFail);
			}
		} 
		catch(ex) 
		{
			_this.log("ERR: Unable to find any audio support.");
			_this.gAudioContext  = null;
		}
		
	};
	this.onFail = function(ex) 
	{
		_this.log("ERR: getUserMedia failed: %s",ex);
	};
	
	//Called when audio capture has been created.
	this.onUserMedia = function(stream) 
	{
		if(!(_this.gAudioSrc = _this.gAudioContext.createMediaStreamSource(stream))) 
		{
			_this.log("ERR: Unable to create audio source.");
		} 
		else 
		{
			_this.LameCreate();
			_this.onRecord();
		}
	}
	
	//Called when the lame library has been loaded.
	this.LameCreate = function() 
	{
	  _this.gIsLame = true;
	  if(!(_this.gEncoder = _this.Mp3Create())) 
	  {
		_this.log("ERR: Unable to create MP3 encoder.");
	  } 
	  else 
	  {
		_this.gStrmMp3 = [];
		_this.gPcmCt = 0;
		_this.gMp3Ct = 0;
		_this.log("Power ON.");
	  }
	}
	
	//Create the mp3 encoder object.
	this.Mp3Create = function() {
	  if(!(_this.gLame = new lamejs())) 
	  {
		_this.log("ERR: Unable to create LAME object.");
	  } 
	  else if(!(_this.gEncoder = new _this.gLame.Mp3Encoder(_this.gCfg.chnlCt,_this.gCfg.sampleRate,_this.gCfg.bitRate))) 
	  {
		_this.log("ERR: Unable to create MP3 encoder.");
	  } 
	  else 
	  {
		_this.log("MP3 encoder created.");
	  }
	  return(_this.gEncoder);
	}
	
	//Shut everything down.
	this.PowerOff = function() 
	{
	  _this.log("Power down...");
	  if(_this.gIsRecording) 
	  {
		_this.log("ERR: PowerOff: You need to stop recording first.");
	  } 
	  else 
	  {
		_this.gEncoder = null;
		_this.gLame = null;
		_this.gNode = null;
		_this.gAudioSrc = null;
		_this.gAudioContext = null;
		_this.log("Power OFF.");
	  }
	}
	//Record button: Begin recording.
	this.onRecord = function(btn) 
	{
	  var creator;
	  _this.log("Start recording...");
	  if(!_this.gAudioContext) 
	  {
		_this.log("ERR: No Audio source.");
	  } 
	  else if(!_this.gEncoder) 
	  {
		_this.log("ERR: No encoder.");
	  } 
	  else if(_this.gIsRecording) 
	  {
		_this.log("ERR: Still recording.");
	  } 
	  else 
	  {
		//Create the audio capture node.
		if(!_this.gNode) 
		{
		  if(!(creator = _this.gAudioSrc.context.createScriptProcessor || _this.gAudioSrc.createJavaScriptNode)) 
		  {
			_this.log("ERR: No processor creator?");
		  } 
		  else if(!(_this.gNode = creator.call(_this.gAudioSrc.context,_this.gCfg.bufSz,_this.gCfg.chnlCt,_this.gCfg.chnlCt))) 
		  {
			_this.log("ERR: Unable to create processor node.");
		  }
		}
		
		if(!_this.gNode) 
		{
			_this.log("ERR: onRecord: No processor node.");
		} 
		else 
		{
			//Set callbacks, connect the node between the audio source and destination.
			_this.gNode.onaudioprocess  = _this.onAudioProcess;
			_this.gAudioSrc.connect(_this.gNode);
			_this.gNode.connect(_this.gAudioSrc.context.destination);
			_this.gIsRecording  = true;
			
			_this.btnDownload.addClass('disabled');
			_this.btnUpload.addClass('disabled');
			_this.btnPlay.addClass('disabled');
			_this.btnDelete.addClass('disabled');
			
			clearInterval(_this.gInterval);
			_this.gStartTime = Date.now();
			_this.showDuration();
			_this.gInterval = setInterval(function(){
				_this.gDuration += _this.deltaTime();
				_this.showDuration();
			}, 1000);
			
			_this.log("RECORD");
		}
	  }
	}
	this.deltaTime = function()
	{
		var currentTime = Date.now();
		var delta = currentTime - this.gStartTime;
		this.gStartTime = currentTime;
		return delta;
	}
	
	//Stop recording
	this.onStop = function(btn) {
	  _this.log("Stop recording...");
	  if(!_this.gAudioContext) 
	  {
		_this.log("ERR: onStop: No audio.");
	  } 
	  else if(!_this.gAudioSrc) 
	  {
		_this.log("ERR: onStop: No audio source.");
	  } 
	  else if(!_this.gIsRecording) 
	  {
		_this.log("ERR: onStop: Not recording.");
	  } 
	  else 
	  {
		//Disconnect the node
		_this.gNode.onaudioprocess = null;
		_this.gAudioSrc.disconnect(_this.gNode);
		_this.gNode.disconnect();
		_this.gIsRecording = false;
		//Flush the last mp3 buffer.
		var mp3 = _this.gEncoder.flush();
		if(mp3.length>0)
		{
			_this.gStrmMp3.push(mp3);
		}
		//Present the mp3 stream on the page.
		
		_this.saveAudio();
		_this.recordEnded();
		clearInterval(_this.gInterval);
		
		_this.log("STOP");
	  }
	}
	
	//Process a single audio buffer.
	//Input is an array of floating-point samples.
	this.onAudioProcess = function(e) 
	{
		if((_this.gDuration/1000) > _this.gTimeLimit)
		{
			clearInterval(_this.gInterval);
			_this.onStop();
			_this.recordEnded();
			_this.gOverLimit = true;
			return;
		}
		//Cap output stream size
		var inBuf = e.inputBuffer;
		var samples = inBuf.getChannelData(0);
		var sampleCt = samples.length;
		//Convert floating-point to 16bit signed int.
		//This may modify the number of samples.
		var samples16 = _this.convertFloatToInt16(samples);
		if(samples16.length > 0) 
		{
			_this.gPcmCt += samples16.length*2;
			//Encode PCM to mp3
			var mp3buf = _this.gEncoder.encodeBuffer(samples16);
			var mp3Ct = mp3buf.length;
			if(mp3Ct>0) 
			{
				//Add buffer to in-memory output stream.
				_this.gStrmMp3.push(mp3buf);
				_this.gMp3Ct += mp3Ct;
			}
		}
	}
	this.showDuration = function()
	{
		var duration = _this.gDuration / 1000;
		var m = Math.floor(duration/60);
		var s = Math.round(duration - (m * 60));
		if(s < 10)
		{
			s = '0'+s;
		}
		_this.status(m+':'+s);
	}
	this.status = function(status) 
	{
		_this.txtStatus.text(status);
	}
	this.deleteSound = function()
	{
		_this.gStrmMp3 = [];
		_this.gPcmCt = 0;
		_this.gMp3Ct = 0;
		_this.gDuration = 0;
		_this.gAudio = new Audio();
		_this.showDuration();
	}
	
	//Convert floating point to 16bit signed int.
	this.convertFloatToInt16 = function(inFloat) 
	{
	  var sampleCt = inFloat.length;
	  var outInt16 = new Int16Array(sampleCt);
	  for(var n1=0;n1<sampleCt;n1++) 
	  {
		//This is where I can apply waveform modifiers.
		var sample16 = 0x8000*inFloat[n1];
		//Clamp value to avoid integer overflow, which causes audible pops and clicks.
		sample16 = (sample16 < -32767) ? -32767 : (sample16 > 32767) ? 32767 : sample16;
		outInt16[n1] = sample16;
	  }
	  return(outInt16);
	}
	this.saveAudio = function()
	{
		_this.gBlob = new Blob(_this.gStrmMp3, {type: 'audio/mp3'});
		var reader = new FileReader();
		reader.readAsDataURL(_this.gBlob); 
		reader.onloadend = function() 
		{
			_this.gAudio = new Audio();
			_this.gAudio.src = reader.result;
			_this.gAudio.onended = function(){
				_this.playEnded();
			}
		}
	};

	this.playEnded = function()
	{
		_this.btnPlay.removeClass('paused').removeClass('disabled');
		_this.btnRecord.removeClass('disabled');
	};
	this.recordEnded = function()
	{
		_this.btnPlay.removeClass('paused').removeClass('disabled');
		_this.btnRecord.removeClass('disabled').removeClass('recording');
		_this.btnDelete.removeClass('disabled');
		_this.btnUpload.removeClass('disabled');
		_this.btnDownload.removeClass('disabled');
		_this.calculateRealDuration();
	};
	this.calculateRealDuration = function()
	{
		var url = URL.createObjectURL(_this.gBlob);
        var preview = new Audio();
        preview.src = url;
		setTimeout(function(){
			_this.gDuration = parseInt(preview.duration * 1000);
		}, 200);
	}
	this.isRecording = function()
	{
		var i, len = audioRecorder.recorder.length;
		for(i = 0; i < len; i++)
		{
			if(audioRecorder.recorder[i].gIsRecording)
			{
				return true;
			}
		}
		return false;
	};
	this.downloadBlob = function()
	{
		var questionID = _this.gAudioController.attr('data-question-id');
		var audioIndex = _this.gAudioController.attr('data-audio-index');
		_this.downloadSound(_this.gBlob, _this.gDuration, questionID, audioIndex);         
	};
	this.uploadBlob = function()
	{
		var questionID = _this.gAudioController.attr('data-question-id');
		var audioIndex = _this.gAudioController.attr('data-audio-index');
		_this.uploadSound(_this.gBlob, _this.gDuration, questionID, audioIndex);         
	};
	this.beforeUpload = function()
	{
		_this.btnUpload.addClass('uploading');
	};
	this.afterUpload = function()
	{
		_this.btnUpload.removeClass('uploading');
	};
	this.playSound = function()
	{
		_this.gAudio.play();
		_this.btnStop.removeClass('disabled');
	};
	this.pauseSound = function()
	{
		_this.gAudio.pause();
		_this.btnStop.removeClass('disabled');
	};
	this.stopSound = function()
	{
		_this.gAudio.pause();
		_this.gAudio.currentTime = 0;
		_this.playEnded();
	};

	var _this = this;
	this.init(audioController, index, args);

}
