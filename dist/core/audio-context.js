// exposes a single instance
"use strict";

var audioContext = null;

var AudioContext = window.webkitAudioContext || window.AudioContext;

if (AudioContext) {
  audioContext = new AudioContext();

  if (/(iPhone|iPad)/i.test(navigator.userAgent) && audioContext.sampleRate !== 44100) {
    var buffer = audioContext.createBuffer(1, 1, 44100);
    var dummy = audioContext.createBufferSource();
    dummy.buffer = buffer;
    dummy.connect(audioContext.destination);
    dummy.start(0);
    dummy.disconnect();

    audioContext.close();
    audioContext = new AudioContext();
  }
}

module.exports = audioContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQzs7QUFFeEIsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUM7O0FBRXBFLElBQUcsWUFBWSxFQUFFO0FBQ2YsY0FBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7O0FBRWxDLE1BQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxZQUFZLENBQUMsVUFBVSxLQUFLLEtBQUssRUFBRTtBQUNuRixRQUFJLE1BQU0sR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDcEQsUUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDOUMsU0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDdEIsU0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDeEMsU0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNmLFNBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQzs7QUFFbkIsZ0JBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNyQixnQkFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7R0FDbkM7Q0FDRjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyIsImZpbGUiOiJlczYvdXRpbHMvc2NoZWR1bGluZy1xdWV1ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGV4cG9zZXMgYSBzaW5nbGUgaW5zdGFuY2VcbnZhciBhdWRpb0NvbnRleHQgPSBudWxsO1xuXG52YXIgQXVkaW9Db250ZXh0ID0gd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCB8fCB3aW5kb3cuQXVkaW9Db250ZXh0O1xuXG5pZihBdWRpb0NvbnRleHQpIHtcbiAgYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG4gIGlmICgvKGlQaG9uZXxpUGFkKS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiYgYXVkaW9Db250ZXh0LnNhbXBsZVJhdGUgIT09IDQ0MTAwKSB7XG4gICAgdmFyIGJ1ZmZlciA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXIoMSwgMSwgNDQxMDApO1xuICAgIHZhciBkdW1teSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICBkdW1teS5idWZmZXIgPSBidWZmZXI7XG4gICAgZHVtbXkuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgIGR1bW15LnN0YXJ0KDApO1xuICAgIGR1bW15LmRpc2Nvbm5lY3QoKTtcblxuICAgIGF1ZGlvQ29udGV4dC5jbG9zZSgpO1xuICAgIGF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGF1ZGlvQ29udGV4dDtcbiJdfQ==