import subprocess,sys
def build(imgs,out,per,fade,crf,gop,size='960x540'):
    n=len(imgs); frames=int(per*24)
    ins=[];fl=[]
    for i,im in enumerate(imgs):
        ins+=['-i',f'assets/{im}.webp']
        zin = "min(zoom+0.0007,1.25)" if i%2==0 else "if(eq(on,1),1.25,max(zoom-0.0007,1.0))"
        fl.append(f"[{i}:v]scale=1920:1440,zoompan=z='{zin}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s={size}:fps=24,setsar=1[v{i}]")
    prev='v0'
    for i in range(1,n):
        off=i*(per-fade)
        fl.append(f"[{prev}][v{i}]xfade=transition=fade:duration={fade}:offset={off}[x{i}]")
        prev=f'x{i}'
    cmd=['ffmpeg','-y','-loglevel','error']+ins+['-filter_complex',';'.join(fl),'-map',f'[{prev}]','-pix_fmt','yuv420p','-an','-c:v','libvpx-vp9','-crf',str(crf),'-b:v','0','-g',str(gop),'-row-mt','1','-deadline','good','-cpu-used','4',out]
    subprocess.run(cmd,check=True)
build(['img3','img1','img7','img4','img3'],'assets/hero.webm',4,1,36,48)
build(['img0','img3','img1','img2','img4','img5'],'assets/scrub.webm',2.6,0.6,34,4)
