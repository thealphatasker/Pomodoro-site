import { useEffect, useRef, useState } from "react";

export interface FaceExpression {
  isSmiling: boolean;
  isFrowning: boolean;
  isSurprised: boolean;
  mouthOpenness: number;
  eyeOpenness: number;
}

export function useFaceDetection(
  videoElement: HTMLVideoElement | null,
  isActive: boolean,
) {
  const [isLookingAway, setIsLookingAway] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("Initializing...");
  const [expression, setExpression] = useState<FaceExpression>({
    isSmiling: false,
    isFrowning: false,
    isSurprised: false,
    mouthOpenness: 0,
    eyeOpenness: 1,
  });

  const detectorRef = useRef<any>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const consecutiveFailures = useRef(0);
  const frameCount = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        setDebugInfo("Loading TensorFlow modules...");
        console.log("🔄 Loading face detection model...");

        const [tfjs, faceLandmarks] = await Promise.all([
          import("@tensorflow/tfjs-core"),
          import("@tensorflow-models/face-landmarks-detection"),
        ]);
        await import("@tensorflow/tfjs-backend-webgl");

        if (cancelled) return;

        setDebugInfo("Initializing TensorFlow backend...");
        console.log("🔄 Initializing TensorFlow backend...");
        await tfjs.ready();
        console.log("✅ TensorFlow backend ready");

        if (cancelled) return;

        setDebugInfo("Creating face detector...");
        console.log("🔄 Creating face detector...");
        const model = faceLandmarks.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig: any = {
          runtime: "tfjs",
          refineLandmarks: true,
          maxFaces: 1,
        };

        detectorRef.current = await faceLandmarks.createDetector(
          model,
          detectorConfig,
        );

        if (!cancelled) {
          setIsLoaded(true);
          setDebugInfo("Model loaded successfully!");
          console.log("✅ Face detection model loaded successfully!");
        }
      } catch (e: any) {
        if (!cancelled) {
          const errorMsg = e?.message ?? "Failed to load face detection";
          console.error("❌ Face detection model failed to load:", e);
          setError(errorMsg);
          setDebugInfo(`Error: ${errorMsg}`);
        }
      }
    }

    loadModel();

    return () => {
      cancelled = true;
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !detectorRef.current) {
      if (!isLoaded) {
        setDebugInfo("Waiting for model to load...");
      }
      return;
    }

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (isActive && videoElement) {
      setDebugInfo("Starting face detection...");
      console.log("🎥 Starting face detection...");
      console.log("Video element:", videoElement);
      console.log("Video ready state:", videoElement.readyState);
      console.log(
        "Video dimensions:",
        videoElement.videoWidth,
        "x",
        videoElement.videoHeight,
      );

      // Wait a bit for video to be fully ready
      setTimeout(() => {
        if (!videoElement) return;

        console.log("Video ready state after delay:", videoElement.readyState);
        console.log("Video playing:", !videoElement.paused);

        detectionIntervalRef.current = setInterval(async () => {
          if (!videoElement || !detectorRef.current) {
            setDebugInfo("Video or detector not available");
            return;
          }

          // Check video state
          if (videoElement.readyState < 2) {
            setDebugInfo(`Video not ready (state: ${videoElement.readyState})`);
            return;
          }

          if (videoElement.paused) {
            setDebugInfo("Video is paused");
            return;
          }

          if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
            setDebugInfo("Video has no dimensions");
            return;
          }

          frameCount.current++;

          try {
            const faces = await detectorRef.current.estimateFaces(
              videoElement,
              {
                flipHorizontal: false,
              },
            );

            consecutiveFailures.current = 0;
            setDebugInfo(
              `Frame ${frameCount.current}: ${faces.length} face(s) detected`,
            );

            if (faces.length === 0) {
              console.log("👤 No face detected");
              setIsLookingAway(true);
              setExpression({
                isSmiling: false,
                isFrowning: false,
                isSurprised: false,
                mouthOpenness: 0,
                eyeOpenness: 1,
              });
            } else {
              const face = faces[0];
              const keypoints = face.keypoints;

              console.log(
                `✅ Face detected with ${keypoints.length} keypoints`,
              );

              if (keypoints && keypoints.length > 0) {
                const nose = keypoints[1];
                const leftEye = keypoints[33];
                const rightEye = keypoints[263];

                const upperLipTop = keypoints[13];
                const lowerLipBottom = keypoints[14];
                const leftMouthCorner = keypoints[61];
                const rightMouthCorner = keypoints[291];

                const leftEyeTop = keypoints[159];
                const leftEyeBottom = keypoints[145];
                const rightEyeTop = keypoints[386];
                const rightEyeBottom = keypoints[374];

                const leftEyebrowInner = keypoints[107];
                const rightEyebrowInner = keypoints[336];

                if (nose && leftEye && rightEye) {
                  const leftDist = Math.abs(nose.x - leftEye.x);
                  const rightDist = Math.abs(nose.x - rightEye.x);
                  const ratio = leftDist / rightDist;

                  const eyeY = (leftEye.y + rightEye.y) / 2;
                  const noseY = nose.y;
                  const faceWidth = Math.abs(leftEye.x - rightEye.x);
                  const verticalRatio = (noseY - eyeY) / faceWidth;

                  const isHeadTurned = ratio < 0.5 || ratio > 2.0;
                  const isLookingDown = verticalRatio > 0.8;
                  const isLookingUp = verticalRatio < -0.3;

                  const lookingAway =
                    isHeadTurned || isLookingDown || isLookingUp;
                  setIsLookingAway(lookingAway);

                  // Calculate expressions
                  const mouthHeight = Math.abs(
                    upperLipTop.y - lowerLipBottom.y,
                  );
                  const mouthWidth = Math.abs(
                    leftMouthCorner.x - rightMouthCorner.x,
                  );
                  const mouthOpenness = Math.min(
                    1,
                    mouthHeight / (mouthWidth * 0.5),
                  );

                  const mouthCenterY = (upperLipTop.y + lowerLipBottom.y) / 2;
                  const leftCornerLift = mouthCenterY - leftMouthCorner.y;
                  const rightCornerLift = mouthCenterY - rightMouthCorner.y;
                  const avgLift = (leftCornerLift + rightCornerLift) / 2;
                  const isSmiling =
                    avgLift > mouthWidth * 0.05 && mouthOpenness < 0.4;

                  const isFrowning = avgLift < -mouthWidth * 0.03 && !isSmiling;

                  const leftEyeHeight = Math.abs(
                    leftEyeTop.y - leftEyeBottom.y,
                  );
                  const rightEyeHeight = Math.abs(
                    rightEyeTop.y - rightEyeBottom.y,
                  );
                  const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
                  const eyeOpenness = Math.min(
                    1,
                    avgEyeHeight / (faceWidth * 0.15),
                  );

                  const leftBrowHeight = Math.abs(
                    leftEyebrowInner.y - leftEye.y,
                  );
                  const rightBrowHeight = Math.abs(
                    rightEyebrowInner.y - rightEye.y,
                  );
                  const avgBrowHeight = (leftBrowHeight + rightBrowHeight) / 2;
                  const browsRaised = avgBrowHeight > faceWidth * 0.25;
                  const isSurprised =
                    browsRaised && eyeOpenness > 0.8 && mouthOpenness > 0.3;

                  setExpression({
                    isSmiling,
                    isFrowning,
                    isSurprised,
                    mouthOpenness,
                    eyeOpenness,
                  });

                  if (frameCount.current % 10 === 0) {
                    console.log(
                      `😊 Smile: ${isSmiling}, 😟 Frown: ${isFrowning}, 😲 Surprised: ${isSurprised}`,
                    );
                    console.log(
                      `👄 Mouth: ${mouthOpenness.toFixed(2)}, 👁️ Eyes: ${eyeOpenness.toFixed(2)}`,
                    );
                  }
                }
              }
            }
          } catch (e: any) {
            consecutiveFailures.current++;
            const errorMsg = `Detection error: ${e?.message || "Unknown"}`;
            console.error(
              `❌ ${errorMsg} (${consecutiveFailures.current} consecutive)`,
            );
            setDebugInfo(errorMsg);

            if (consecutiveFailures.current > 5) {
              setIsLookingAway(true);
            }
          }
        }, 300);
      }, 1000); // Wait 1 second for video to stabilize
    } else {
      if (!isActive) {
        setDebugInfo("Detection inactive");
      } else if (!videoElement) {
        setDebugInfo("No video element");
      }
      console.log("⏸️ Face detection stopped");
      setIsLookingAway(false);
      consecutiveFailures.current = 0;
      frameCount.current = 0;
      setExpression({
        isSmiling: false,
        isFrowning: false,
        isSurprised: false,
        mouthOpenness: 0,
        eyeOpenness: 1,
      });
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [isActive, isLoaded, videoElement]);

  return { isLookingAway, isLoaded, error, expression, debugInfo };
}
