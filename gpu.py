import torch

print("CUDA available:", torch.cuda.is_available())
print("GPU model:", torch.cuda.get_device_name(0))
print(torch.__version__)
print(torch.version.cuda)
print(torch.cuda.get_arch_list())
